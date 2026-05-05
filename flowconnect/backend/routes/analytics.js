const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'flowconnect',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

router.get('/analytics', async (req, res) => {
  try {
    const { dateRange = '30days' } = req.query;
    
    // Calculate date filter
    let dateFilter = '';
    let params = [];
    
    if (dateRange !== 'all') {
      const days = dateRange === '7days' ? 7 : 30;
      dateFilter = 'AND created_at > NOW() - INTERVAL \'' + days + ' days\'';
    }
    
    // 1. Summary stats
    const summaryQuery = `
      SELECT 
        (SELECT COUNT(*) FROM workflows) AS total_workflows,
        (SELECT COUNT(*) FROM workflows WHERE status = 'active') AS active_workflows,
        (SELECT COUNT(*) FROM executions WHERE 1=1 ${dateFilter}) AS total_executions,
        5 AS connected_apps
    `;
    const summaryResult = await pool.query(summaryQuery);
    
    // 2. Execution history (group by date)
    const historyQuery = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as executions
      FROM executions
      WHERE 1=1 ${dateFilter}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `;
    const historyResult = await pool.query(historyQuery);
    const executionHistory = historyResult.rows.map(row => ({
      date: row.date,
      executions: parseInt(row.executions)
    }));
    
    // 3. Success/Failure stats
    const successFailureQuery = `
      SELECT 
        status,
        COUNT(*) as count
      FROM executions
      WHERE 1=1 ${dateFilter}
      GROUP BY status
    `;
    const successFailureResult = await pool.query(successFailureQuery);
    
    let successful = 0, failed = 0;
    successFailureResult.rows.forEach(row => {
      if (row.status === 'success') successful = parseInt(row.count);
      if (row.status === 'failed') failed = parseInt(row.count);
    });
    
    // 4. Most active flows
    const mostActiveQuery = `
      SELECT 
        w.name,
        COUNT(e.id) as executions
      FROM executions e
      JOIN workflows w ON e.workflow_id = w.id
      WHERE 1=1 ${dateFilter}
      GROUP BY w.id, w.name
      ORDER BY executions DESC
      LIMIT 5
    `;
    const mostActiveResult = await pool.query(mostActiveQuery);
    const mostActiveFlows = mostActiveResult.rows.map(row => ({
      name: row.name,
      executions: parseInt(row.executions)
    }));
    
    // 5. Recent activity
    const recentActivityQuery = `
      SELECT 
        e.id,
        w.name,
        e.created_at as timestamp,
        e.status
      FROM executions e
      JOIN workflows w ON e.workflow_id = w.id
      WHERE 1=1 ${dateFilter}
      ORDER BY e.created_at DESC
      LIMIT 10
    `;
    const recentActivityResult = await pool.query(recentActivityQuery);
    const recentActivity = recentActivityResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      timestamp: row.timestamp,
      status: row.status,
      executionCount: 1
    }));
    
    res.json({
      success: true,
      data: {
        summary: {
          totalWorkflows: parseInt(summaryResult.rows[0].total_workflows),
          activeWorkflows: parseInt(summaryResult.rows[0].active_workflows),
          totalExecutions: parseInt(summaryResult.rows[0].total_executions),
          connectedApps: summaryResult.rows[0].connected_apps
        },
        executionHistory: executionHistory.reverse(),
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