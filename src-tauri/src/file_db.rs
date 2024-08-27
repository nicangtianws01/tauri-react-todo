use dirs2::home_dir;
use std::fs::{create_dir, File, OpenOptions};
use std::io::{self, BufWriter, Write};
use std::path::PathBuf;

use serde::ser::{Serialize, SerializeStruct, Serializer};

#[derive(Debug, serde::Deserialize)]
pub struct Todo {
    pub todo: String,
    pub tag: String,
    pub status: String,
}

impl Todo {
    pub fn init(todo: String, tag: String, status: String) -> Todo {
        Todo { todo, tag, status }
    }
    pub fn to_string(&self) -> String {
      format!("\"{}\",\"{}\",\"{}\"\n", &self.todo, &self.tag, &self.status)
    }
}

impl Serialize for Todo {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        // 3 is the number of fields in the struct.
        let mut state = serializer.serialize_struct("Todo", 3)?;
        state.serialize_field("todo", &self.todo)?;
        state.serialize_field("tag", &self.tag)?;
        state.serialize_field("status", &self.status)?;
        state.end()
    }
}

pub struct Database {
    pub file: File,
}

impl Database {
    // 打开数据库文件
    pub fn open() -> Database {
        let db_file = get_db_file();

        let file = OpenOptions::new()
            .create(true)
            .read(true)
            .write(true)
            .append(true)
            .open(db_file)
            .unwrap();
        Database { file }
    }

    pub fn list(&self) -> String {
        let f = &self.file;
        let reader = io::BufReader::new(f);

        let mut rdr = csv::ReaderBuilder::new().from_reader(reader);

        let mut contents: Vec<Todo> = Vec::new();
        for record in rdr.deserialize() {
            let todo: Todo = record.expect("error parse todo");
            contents.push(todo);
        }

        // let mut contents: Vec<String> = reader
        //     .lines()
        //     .map(|l| l.expect("could not parse line"))
        //     .collect();

        contents.reverse();
        return serde_json::to_string(&contents).expect("[]");
    }

    pub fn add(&self, todo: &str) -> String {
        let f = &self.file;
        let todo_item = Todo::init(todo.to_string(), "".to_string(), "TODO".to_string());
        let mut writer = BufWriter::new(f);
        writer
            .write(todo_item.to_string().as_bytes())
            .expect("error save todo");

        return serde_json::to_string(&todo_item).expect("{}");
    }
    pub fn remove(&self, _id: u8) -> String {
        return "success".to_string();
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

    file_path.push("todo.txt");

    let path = file_path.as_path();
    let exists = file_path.exists();
    if !exists {
        File::create_new(path).expect("error create file");
    }

    return file_path;
}
