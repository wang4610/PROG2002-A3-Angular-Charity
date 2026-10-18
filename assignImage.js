const mysql = require('mysql2/promise');

async function assignImages() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'wc10154610',
    database: 'charityevents_db'
  });

  // 获取全部81张图片
  const [imgRows] = await pool.query('SELECT img_url FROM image_pool WHERE img_url IS NOT NULL ORDER BY img_id');
  console.log(`图片总数：${imgRows.length}`);

  // 获取全部活动
  const [eventRows] = await pool.query('SELECT event_id FROM charity_events ORDER BY event_id');
  console.log(`活动总数：${eventRows.length}`);

  // 循环分配图片
  for(let i = 0; i < eventRows.length; i++){
    const imgUrl = imgRows[i % imgRows.length].img_url;
    await pool.query('UPDATE charity_events SET image_url = ? WHERE event_id = ?', [imgUrl, eventRows[i].event_id]);
  }

  console.log("✅ 图片分配完成！");
  await pool.end();
}

assignImages().catch(err=>{
  console.error('报错：',err);
});
