use std::path::PathBuf;

use dirs2::home_dir;
use rusqlite::{named_params, params, Connection};
use std::fs::{create_dir, File};

#[derive(serde::Serialize)]
pub struct Todo {
    pub id: i32,
    pub title: String,
    pub tag: String,
    pub status: String,
}

#[derive(serde::Serialize)]
pub struct Tag {
    pub id: i32,
    pub name: String,
    pub del_flag: i32,
}

pub struct Database {
    pub conn: Connection,
}

impl Database {
    // 打开数据库文件
    pub fn open() -> Database {
        let path = get_db_file();
        let conn = Connection::open(path).expect("error open db");
        conn.execute(
            "create table if not exists todos (
           id integer primary key,
           title text not null,
           tag text,
           status text not null
       )",
            (),
        )
        .expect("error init db");
    
        conn.execute(
            "create table if not exists tags (
           id integer primary key,
           name text not null,
           del_flag integer default 0
       )",
            (),
        )
        .expect("error init db");
        Database { conn }
    }

    pub fn list(&self, kw: &str) -> String {
        let conn = &self.conn;
        if kw.len() != 0 {
            let keyword = format!("%{}%", kw);
            let sql =
                "select id, title, tag, status from todos where title like :title order by id desc"
                    .to_string();
            let mut stmt = conn.prepare(&sql).expect("error list todos");
            let rows = stmt
                .query_map(&[(":title", keyword.as_str())], |row| {
                    Ok(Todo {
                        id: row.get(0)?,
                        title: row.get(1)?,
                        tag: row.get(2)?,
                        status: row.get(3)?,
                    })
                })
                .expect("error list todo");
            let todos: Vec<Todo> = rows.map(|row| row.expect("error get todo")).collect();
            return serde_json::to_string(&todos).expect("error parse todo");
        } else {
            let sql = "select id, title, tag, status from todos order by id desc".to_string();
            let mut stmt = conn.prepare(&sql).expect("error list todos");
            let rows = stmt
                .query_map((), |row| {
                    Ok(Todo {
                        id: row.get(0)?,
                        title: row.get(1)?,
                        tag: row.get(2)?,
                        status: row.get(3)?,
                    })
                })
                .expect("error list todo");
            let todos: Vec<Todo> = rows.map(|row| row.expect("error get todo")).collect();
            return serde_json::to_string(&todos).expect("error parse todo");
        }
    }

    pub fn add(&self, title: &str) -> String {
        let conn = &self.conn;
        let todo = Todo {
            id: 0,
            title: title.to_string(),
            tag: "".to_string(),
            status: "".to_string(),
        };
        conn.execute(
            "INSERT INTO todos (title, tag, status) VALUES (?1, ?2, ?3)",
            (&todo.title, "", "TODO"),
        )
        .expect("error add todo");
        return "success".to_string();
    }
    pub fn remove(&self, _id: i32) -> String {
        let conn = &self.conn;
        conn.execute("delete from todos where id=?1", params![_id])
            .expect("error delete todo");
        return "success".to_string();
    }
    pub fn mark(&self, _id: i32, status: &str) -> String {
        let conn = &self.conn;
        conn.execute(
            "update todos set status=?1 where id=?2",
            params![status, _id],
        )
        .expect("error mark todo");
        return "success".to_string();
    }
    pub fn update(&self, _id: i32, title: &str) -> String {
        let conn = &self.conn;
        conn.execute(
            "update todos set title=:title where id=:id",
            named_params! {":title": title, ":id": _id},
        )
        .expect("error mark todo");
        return "success".to_string();
    }

    pub fn add_tag(&self, name: &str) -> String {
        let conn = &self.conn;
        let tag = Tag {
            id: 0,
            name: name.to_string(),
            del_flag: 0,
        };
        conn.execute(
            "INSERT INTO tags (name) VALUES (:name)",
            named_params! {":name": &tag.name}
        )
        .expect("error add todo");
        return "success".to_string();
    }

    pub fn update_tag(&self, _id: i32, name: &str) -> String {
        let conn = &self.conn;
        let tag = Tag {
            id: _id,
            name: name.to_string(),
            del_flag: 0,
        };
        conn.execute(
            "update tags set name=:name where id=:id",
            named_params! {":id": &tag.id, ":name": &tag.name}
        )
        .expect("error add todo");
        return "success".to_string();
    }

    pub fn del_tag(&self, _id: i32) -> String {
        let conn = &self.conn;
        let tag = Tag {
            id: _id,
            name: "".to_string(),
            del_flag: 0,
        };
        conn.execute(
            "update tags set del_flag = 1 where id=:id",
            named_params! {":id": &tag.id}
        )
        .expect("error add todo");
        return "success".to_string();
    }

    pub fn list_tag(&self) -> String {
        let conn = &self.conn;
        let sql = "select id, name, del_flag from tags order by id desc".to_string();
            let mut stmt = conn.prepare(&sql).expect("error list tag");
            let rows = stmt
                .query_map((), |row| {
                    Ok(Tag {
                        id: row.get(0)?,
                        name: row.get(1)?,
                        del_flag: row.get(2)?,
                    })
                })
                .expect("error list tag");
            let tags: Vec<Tag> = rows.map(|row| row.expect("error get tag")).collect();
            return serde_json::to_string(&tags).expect("error parse tag");
    }
}

fn get_db_file() -> PathBuf {
    let mut file_path = home_dir().expect("error find home dir");
    file_path.push("Documents");
    file_path.push("TauriTodo");
    let dir = file_path.as_path();
    if !file_path.exists() {
        create_dir(dir).expect("error create dir");
    }

    file_path.push("todo.db");

    let path = file_path.as_path();
    let exists = file_path.exists();
    if !exists {
        File::create_new(path).expect("error create file");
    }

    return file_path;
}
