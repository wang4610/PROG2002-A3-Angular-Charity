const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());
// cPanel 部署时自动去掉 /charity-api 前缀，兼容本地和线上环境
app.use((req, res, next) => {
  if (req.url.startsWith('/charity-api')) {
    req.url = req.url.replace('/charity-api', '');
  }
  next();
});
// MySQL连接 - 本地和线上环境自动切换
const isProduction = process.env.NODE_ENV === 'production';
const db = mysql.createConnection({
  host: 'localhost',
  user: isProduction ? 'cwang47_charityuser' : 'root',
  password: isProduction ? 'wc10154610@' : 'wc10154610',
  database: isProduction ? 'cwang47_charityevents' : 'charityevents_db'
});
db.connect(err => {
  if(err) {
    console.log('数据库连接失败：',err);
  } else {
    console.log('✅ MySQL数据库连接成功');
  }
});
// 1.首页活动列表接口 /api/home-events
app.get('/api/home-events', (req,res)=>{
  const sql = `SELECT e.*, c.cat_name, o.org_name, o.org_logo_url
  FROM charity_events e
  LEFT JOIN event_categories c ON e.cat_id = c.cat_id
  LEFT JOIN charity_organisations o ON e.org_id = o.org_id
  ORDER BY e.event_date DESC`;
  db.query(sql, (err, rows)=>{
    if(err){
      console.log("SQL错误：",err);
      return res.status(500).json({message: err.message});
    }
    // 数据库字段映射前端字段
    const data = rows.map(item => ({
      id: item.event_id,
      title: item.event_name,
      description: item.event_short_desc,
      fullDescription: item.event_full_description,
      location: item.location,
      category: item.cat_name,
      event_date: item.event_date,
      price: item.ticket_price,
      progress_percent: 0,
      imageUrl: item.image_url,
      org_name: item.org_name,
      org_logo_url: item.org_logo_url,
      charity_goal_amount: item.charity_goal_amount
    }));
    res.json({data});
  })
})
// 2.获取单个活动详情 /api/events/:id
app.get('/api/events/:id', (req,res)=>{
  const id = req.params.id;
  const sql = `SELECT e.*, c.cat_name, o.org_name, o.org_logo_url
  FROM charity_events e
  LEFT JOIN event_categories c ON e.cat_id = c.cat_id
  LEFT JOIN charity_organisations o ON e.org_id = o.org_id
  WHERE e.event_id = ?`;
  db.query(sql, [id], (err, result)=>{
    if(err){
      console.log("SQL错误：",err);
      return res.status(500).json({message: err.message});
    }
    if(result.length ===0) return res.status(404).json({message:"活动不存在"});
    const item = result[0];
    const mapped = {
      id: item.event_id,
      title: item.event_name,
      description: item.event_short_desc,
      fullDescription: item.event_full_description,
      location: item.location,
      category: item.cat_name,
      event_date: item.event_date,
      price: item.ticket_price,
      progress_percent: 0,
      imageUrl: item.image_url,
      org_name: item.org_name,
      org_logo_url: item.org_logo_url,
      charity_goal_amount: item.charity_goal_amount
    };
    res.json({data: mapped});
  })
})
// 3.报名接口 /api/register
app.post('/api/register', (req,res)=>{
  console.log("前端提交 req.body = ", req.body);
  const {event_id, full_name, email, phone, ticket_count} = req.body;
  if(!full_name || !email || !event_id || !ticket_count){
    return res.status(400).json({message:"姓名、邮箱、活动ID、购票数量不能为空"});
  }
  const checkSql = `SELECT * FROM event_registrations WHERE event_id = ? AND email = ?`;
  db.query(checkSql, [event_id, email], (checkErr, checkResult)=>{
    if(checkErr){
      console.log("校验查询报错：", checkErr);
      return res.status(500).json({message:"校验失败",error:checkErr.message});
    }
    if(checkResult.length > 0){
      return res.status(409).json({message:"You have already registered for this event"});
    }
    const insertSql = "INSERT INTO event_registrations(event_id, full_name, email, phone, ticket_count) VALUES (?,?,?,?,?)";
    db.query(insertSql,[event_id, full_name, email, phone, ticket_count], (insertErr, result)=>{
      if(insertErr){
        console.log("报名数据库错误：", insertErr);
        if(insertErr.code === 'ER_DUP_ENTRY'){
          return res.status(409).json({message:"You have already registered for this event"});
        }
        return res.status(500).json({message:"报名失败",error:insertErr.message});
      }
      res.json({message:"报名成功",registrationId:result.insertId});
    })
  })
})
//4.读取活动报名记录 /api/events/:id/registrations
app.get('/api/events/:id/registrations', (req,res)=>{
  const eventId = req.params.id;
  db.query('SELECT registration_id, event_id, full_name, email, phone, ticket_count, register_time FROM event_registrations WHERE event_id = ?',[eventId],(err,result)=>{
    if(err) return res.status(500).json({message: err.message});
    res.json({data: result});
  })
})
//5.首页统计数字接口 /api/stats（首页大数字）
app.get('/api/stats', (req,res)=>{
  const sqlFund = "SELECT SUM(IFNULL(ticket_price,0)) AS totalFund FROM charity_events";
  const sqlEventCount = "SELECT COUNT(*) AS totalEvent FROM charity_events";
  const sqlRegCount = "SELECT COUNT(*) AS totalReg FROM event_registrations";
  const sqlOrgCount = "SELECT COUNT(DISTINCT org_id) AS partner FROM charity_events";
  db.query(sqlFund, (err1, fundRes) => {
    if(err1) fundRes = [{totalFund:0}];
    db.query(sqlEventCount, (err2, eventRes) => {
      if(err2) eventRes = [{totalEvent:0}];
      db.query(sqlRegCount, (err3, regRes) => {
        if(err3) regRes = [{totalReg:0}];
        db.query(sqlOrgCount, (err4, orgRes) => {
          if(err4) orgRes = [{partner:0}];
          const data = {
            totalFund: fundRes[0].totalFund || 0,
            totalEvent: eventRes[0].totalEvent || 0,
            totalReg: regRes[0].totalReg || 0,
            partner: orgRes[0].partner || 0
          };
          res.json({data});
        })
      })
    })
  })
})
//6.分类接口 /api/categories
app.get('/api/categories', (req,res)=>{
  db.query("SELECT cat_id AS id, cat_name AS name FROM event_categories", (err, result)=>{
    if(err) return res.status(500).json({message: err.message});
    res.json({data: result});
  })
})
// 慈善机构下拉接口，admin-new.html使用
app.get('/api/organisations', (req,res)=>{
  db.query("SELECT org_id AS id, org_name AS name FROM charity_organisations", (err, result)=>{
    if(err) return res.status(500).json({message: err.message});
    res.json({data: result});
  })
})
// 价格下拉选项接口 返回纯数字数组
app.get('/api/price-options', (req,res)=>{
  const sql = `SELECT DISTINCT ticket_price FROM charity_events ORDER BY ticket_price ASC`;
  db.query(sql, (err, result)=>{
    if(err){
      console.log("价格选项SQL错误：",err);
      return res.status(500).json({message: err.message});
    }
    const priceList = result.map(item => item.ticket_price);
    res.json({data: priceList});
  })
})
//7.搜索活动接口 /api/events/search
app.get('/api/events/search', (req,res)=>{
  let sql = `SELECT e.*, c.cat_name, o.org_name FROM charity_events e
  LEFT JOIN event_categories c ON e.cat_id = c.cat_id
  LEFT JOIN charity_organisations o ON e.org_id = o.org_id WHERE 1=1`;
  const params = [];
  const q = req.query;
  if(q.cat_id){
    sql += " AND e.cat_id = ?";
    params.push(q.cat_id);
  }
  //新增：前端传category名称，按分类名字过滤
  if(q.category){
    sql += " AND c.cat_name = ?";
    params.push(q.category);
  }
  if(q.location){
    sql += " AND e.location LIKE ?";
    params.push(`%${q.location}%`);
  }
  if(q.event_date){
    sql += " AND e.event_date >= ?";
    params.push(q.event_date);
  }
  if(q.maxPrice){
    sql += " AND e.ticket_price <= ?";
    params.push(q.maxPrice);
  }
  if(q.onlyUpcoming === "true"){
    sql += " AND e.event_date >= CURDATE()";
  }
  if(q.onlyFree === "true"){
    sql += " AND e.ticket_price = 0";
  }
  db.query(sql, params, (err, result)=>{
    if(err){
      console.log("搜索SQL错误：",err);
      return res.status(500).json({message: err.message});
    }
    const data = result.map(item => ({
      id: item.event_id,
      title: item.event_name,
      description: item.event_short_desc,
      fullDescription: item.event_full_description,
      location: item.location,
      category: item.cat_name,
      event_date: item.event_date,
      price: item.ticket_price,
      progress_percent: 0,
      imageUrl: item.image_url,
      org_name: item.org_name,
      org_logo_url: item.org_logo_url
    }));
    res.json({data});
  })
})
// ========= 管理员CRUD接口 =========
// 获取全部活动列表（管理员）
app.get('/api/admin/events', (req,res)=>{
  const sql = `SELECT * FROM charity_events`;
  db.query(sql,(err,rows)=>{
    if(err) return res.status(500).json({message:err.message});
    const data = rows.map(item => ({
      event_id: item.event_id,
      title: item.event_name,
      description: item.event_short_desc,
      event_date: item.event_date,
      location: item.location,
      cat_id: item.cat_id,
      price: item.ticket_price,
      org_id: item.org_id,
      image_url: item.image_url
    }));
    res.json({data});
  });
});
// 管理员新增活动 POST【图片池逻辑，按顺序优先复用空闲图片】
app.post('/api/admin/events', (req,res)=>{
  const {title,description,event_date,location,cat_id,price,org_id,image_url} = req.body;
  // 如果前端手动填写图片链接，直接使用，不走图片池
  if(image_url && image_url.trim() !== ""){
    const sql = `INSERT INTO charity_events(event_name,event_short_desc,event_full_description,event_date,location,cat_id,ticket_price,org_id,image_url,charity_goal_amount)
    VALUES (?,?,?,?,?,?,?,?,?,?)`;
    db.query(sql,[
      title,description,description,event_date,location,cat_id,price,org_id,image_url,0
    ],(err,result)=>{
      if(err){
        console.log("新增SQL错误：",err);
        return res.status(400).json({message:err.message});
      }
      res.json({success:true, message:"新增活动成功",eventId:result.insertId});
    });
    return;
  }
  // 前端图片为空：查找图片池第一条空闲图片，按img_id升序
  db.query("SELECT * FROM image_pool WHERE is_occupied = 0 ORDER BY img_id ASC LIMIT 1", (err, poolRows)=>{
    if(err){
      console.log("读取图片池失败",err);
      return res.status(500).json({message:"读取图片池失败"});
    }
    if(poolRows.length === 0){
      return res.status(400).json({message:"图片池全部用完，没有空闲图片！"});
    }
    const selectedImg = poolRows[0];
    const selectedImgUrl = selectedImg.img_url;
    const selectedImgId = selectedImg.img_id;
    // 标记图片为已占用
    db.query("UPDATE image_pool SET is_occupied = 1 WHERE img_id = ?", [selectedImgId], (errOccupy)=>{
      if(errOccupy){
        console.log("标记图片占用失败",errOccupy);
        return res.status(500).json({message:"标记图片占用失败"});
      }
      // 插入活动记录
      const sql = `INSERT INTO charity_events(event_name,event_short_desc,event_full_description,event_date,location,cat_id,ticket_price,org_id,image_url,charity_goal_amount)
      VALUES (?,?,?,?,?,?,?,?,?,?)`;
      db.query(sql,[
        title,description,description,event_date,location,cat_id,price,org_id,selectedImgUrl,0
      ],(err,result)=>{
        if(err){
          console.log("新增活动失败，释放图片",err);
          // 如果活动插入失败，把图片释放回去
          db.query("UPDATE image_pool SET is_occupied = 0 WHERE img_id = ?",[selectedImgId]);
          return res.status(400).json({message:err.message});
        }
        res.json({success:true, message:"新增活动成功，自动分配图片",eventId:result.insertId});
      });
    })
  })
});
// 管理员更新活动 PUT
app.put('/api/admin/events/:id', (req,res)=>{
  const id = req.params.id;
  const {title,description,event_date,location,cat_id,price,org_id,image_url} = req.body;
  const sql = `UPDATE charity_events SET event_name=?, event_short_desc=?, event_full_description=?, event_date=?, location=?, cat_id=?, ticket_price=?, org_id=?, image_url=? WHERE event_id=?`;
  db.query(sql,[
    title,description,description,event_date,location,cat_id,price,org_id,image_url, id
  ],(err)=>{
    if(err){
      console.log("更新SQL错误：",err);
      return res.status(400).json({message:err.message});
    }
    res.json({success:true, message:"更新活动成功"});
  });
});
// 管理员删除活动【自动删除关联报名记录，删除时释放图片回图片池】
app.delete('/api/admin/events/:id', (req,res)=>{
  const eventId = req.params.id;
  // 第一步：查询这个活动绑定的图片url
  db.query("SELECT image_url FROM charity_events WHERE event_id = ?", [eventId], (err, eventRow)=>{
    if(err){
      return res.status(500).json({message:"查询活动图片失败"});
    }
    if(eventRow.length === 0){
      return res.status(404).json({message:"活动不存在"});
    }
    const imgUrl = eventRow[0].image_url;
    // ✅ 先删除这个活动所有报名记录
    db.query("DELETE FROM event_registrations WHERE event_id = ?",[eventId],(errDelReg)=>{
      if(errDelReg) return res.status(500).json({message:"删除报名记录失败"});
      // 删除活动
      db.query("DELETE FROM charity_events WHERE event_id = ?",[eventId],(errDel)=>{
        if(errDel) return res.status(500).json({message:errDel.message});
        // 将图片标记为空闲，放回图片池
        db.query("UPDATE image_pool SET is_occupied = 0 WHERE img_url = ?", [imgUrl], ()=>{
          res.json({success:true, message:"删除活动成功，报名记录已清除，图片已释放回图片池"});
        })
      })
    })
  })
});
// 调试接口：查看图片池状态
app.get('/api/image-pool', (req,res)=>{
  db.query("SELECT * FROM image_pool ORDER BY img_id ASC", (err, rows)=>{
    if(err) return res.status(500).json({message:err.message});
    res.json({data: rows});
  })
})
// ✅【图片一键分配接口，全部活动重新分配图片，不需要oldImgUrl】
app.get('/api/fix-event-img', (req,res)=>{
  // 取出全部活动
  db.query(`SELECT event_id FROM charity_events ORDER BY event_id ASC`,(errEvt, eventList)=>{
    if(errEvt){
      return res.status(500).json({success:false,msg:"读取活动失败",error:errEvt.message});
    }
    if(eventList.length ===0){
      return res.json({success:true,msg:"数据库没有活动"});
    }
    // 取出所有空闲图片
    db.query(`SELECT img_id, img_url FROM image_pool WHERE is_occupied = 0 ORDER BY img_id ASC`,(errImg, freeImgList)=>{
      if(errImg){
        return res.status(500).json({success:false,msg:"读取图片池失败",error:errImg.message});
      }
      if(freeImgList.length ===0){
        return res.json({success:false,msg:"图片池没有空闲图片，请先往image_pool表插入图片"});
      }
      let updateCount = 0;
      function next(i){
        if(i >= eventList.length || i >= freeImgList.length){
          return res.json({success:true, message:`✅ 成功分配${updateCount}张图片`});
        }
        const eid = eventList[i].event_id;
        const newImgUrl = freeImgList[i].img_url;
        const newImgId = freeImgList[i].img_id;
        //更新活动图片
        db.query(`UPDATE charity_events SET image_url=? WHERE event_id=?`,[newImgUrl,eid],(errUpd)=>{
          if(errUpd){
            console.log("更新活动图片失败",errUpd);
            return next(i+1);
          }
          //标记图片占用
          db.query(`UPDATE image_pool SET is_occupied=1 WHERE img_id=?`,[newImgId],(errOcc)=>{
            if(!errOcc) updateCount++;
            next(i+1);
          })
        })
      }
      next(0);
    })
  })
})

app.listen(port, ()=>{
  console.log(`🚀 Server running at http://localhost:${port}`);
})
