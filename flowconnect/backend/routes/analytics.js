const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Define models
const Workflow = mongoose.model('Workflow', new mongoose.Schema({
  name: String,
  status: String,
  createdAt: Date,
  updatedAt: Date
}, { strict: false }));

const Execution = mongoose.model('Execution', new mongoose.Schema({
  workflowId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow' },
  status: String,
  createdAt: Date,
  executionTime: Number
}, { strict: false }));

router.get('/analytics', async (req, res) => {
  try {
    const { dateRange = '30days' } = req.query;
    
    let dateFilter = {};
    if (dateRange !== 'all') {
      const days = dateRange === '7days' ? 7 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      dateFilter = { createdAt: { $gte: startDate } };
    }
    
    const [totalWorkflows, activeWorkflows, totalExecutions] = await Promise.all([
      Workflow.countDocuments(),
      Workflow.countDocuments({ status: 'active' }),
      Execution.countDocuments(dateFilter)
    ]);
    
    const executionHistoryRaw = await Execution.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          executions: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);
    
    const executionHistory = executionHistoryRaw.map(item => ({
      date: item._id,
      executions: item.executions
    }));
    
    const successFailureRaw = await Execution.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const successful = successFailureRaw.find(s => s._id === 'success')?.count || 0;
    const failed = successFailureRaw.find(s => s._id === 'failed')?.count || 0;
    
    const mostActiveRaw = await Execution.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$workflowId',
          executions: { $sum: 1 }
        }
      },
      { $sort: { executions: -1 } },
      { $limit: 5 }
    ]);
    
    const workflowIds = mostActiveRaw.map(item => item._id);
    const workflows = await Workflow.find({ _id: { $in: workflowIds } });
    const workflowMap = new Map(workflows.map(w => [w._id.toString(), w.name]));
    
    const mostActiveFlows = mostActiveRaw.map(item => ({
      name: workflowMap.get(item._id?.toString()) || 'Unknown',
      executions: item.executions
    }));
    
    const recentActivityRaw = await Execution.find(dateFilter)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('workflowId', 'name');
    
    const recentActivity = recentActivityRaw.map(item => ({
      id: item._id,
      name: item.workflowId?.name || 'Unknown',
      timestamp: item.createdAt,
      status: item.status,
      executionCount: 1
    }));
    
    res.json({
      success: true,
      data: {
        summary: {
          totalWorkflows,
          activeWorkflows,
          totalExecutions,
          connectedApps: 5
        },
        executionHistory,
        successFailureStats: { successful, failed },
        mostActiveFlows,
        recentActivity
      }
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;