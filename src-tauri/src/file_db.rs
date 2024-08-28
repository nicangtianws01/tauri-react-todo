use dirs2::home_dir;
use std::fs::{create_dir, File, OpenOptions};
use std::io::{self, BufWriter, Write};
use std::path::PathBuf;

use serde::ser::{Serialize, SerializeStruct, Serializer};

static mut NEXT_ID: usize = 0;

#[derive(Debug, serde::Deserialize)]
pub struct Todo {
    pub id: u8,
    pub todo: String,
    pub tag: String,
    pub status: String,
}

impl Todo {
    pub fn init(id: u8, todo: String, tag: String, status: String) -> Todo {
        Todo {
            id,
            todo,
            tag,
            status,
        }
    }
    pub fn to_string(&self) -> String {
        format!(
            "\"{}\",\"{}\",\"{}\",\"{}\"\n",
            &self.id, &self.todo, &self.tag, &self.status
        )
    }
}

impl Serialize for Todo {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        // 3 is the number of fields in the struct.
        let mut state = serializer.serialize_struct("Todo", 3)?;
        state.serialize_field("id", &self.id)?;
        state.serialize_field("todo", &self.todo)?;
        state.serialize_field("tag", &self.tag)?;
        state.serialize_field("status", &self.status)?;
        state.end()
    }
}

pub struct Database {
    pub file: File,
    pub path: PathBuf,
}

impl Database {
    // 打开数据库文件
    pub fn open(append: bool) -> Database {
        let db_file = get_db_file();
        let path = db_file.clone();
        let file = OpenOptions::new()
            .read(true)
            .write(true)
            .append(append)
            .open(db_file)
            .unwrap();
        Database { file, path }
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

        let mut last_id = 0;
        if contents.len() > 0 {
            let last_todo = contents.last().expect("error get last todo");
            last_id = last_todo.id;
        }

        unsafe {
            NEXT_ID = (last_id + 1) as usize;
        }
        contents.reverse();
        return serde_json::to_string(&contents).expect("[]");
    }

    pub fn add(&self, todo: &str) -> String {
        unsafe {
            if NEXT_ID == 0 {
                return "error save todo".to_string();
            }
        }
        let f = &self.file;
        let id;
        unsafe {
            NEXT_ID += 1;
            id = NEXT_ID as u8;
        }
        let todo_item = Todo::init(id, todo.to_string(), "".to_string(), "TODO".to_string());
        let writer = BufWriter::new(f);
        let mut wtr = csv::WriterBuilder::new()
            .double_quote(true)
            .has_headers(false)
            .from_writer(writer);
        wtr.serialize(&todo_item).expect("error save todo");
        // writer
        //     .write(todo_item.to_string().as_bytes())
        //     .expect("error save todo");

        return serde_json::to_string(&todo_item).expect("{}");
    }
    pub fn remove(&self, _id: u8) -> String {
        let f = &self.file;
        let reader = io::BufReader::new(f);

        let mut rdr = csv::ReaderBuilder::new().from_reader(reader);

        let mut contents: Vec<Todo> = Vec::new();
        for record in rdr.deserialize() {
            let todo: Todo = record.expect("error parse todo");
            contents.push(todo);
        }

        contents.retain(|item| item.id != _id);

        let todofile = OpenOptions::new()
            .write(true) // a) write
            .truncate(true) // b) truncrate
            .open(&self.path)
            .expect("Couldn't open the todo file");
        let writer = io::BufWriter::new(todofile);
        let mut wtr = csv::WriterBuilder::new()
            .double_quote(true)
            .from_writer(writer);

        if contents.len() == 0 {
            wtr.write_record(&["id", "todo", "tag", "status"])
                .expect("error save todo");
        } else {
            for todo in contents {
                wtr.serialize(todo).expect("error save todo");
            }
            wtr.flush().expect("error flush file");
        }

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

    file_path.push("todo.csv");

    let path = file_path.as_path();
    let exists = file_path.exists();
    if !exists {
        File::create_new(path).expect("error create file");
        let mut file = OpenOptions::new()
            .read(true)
            .write(true)
            .open(path)
            .expect("error open file");
        file.write(format!("id,todo,tag,status").as_bytes())
            .expect("error init file");
    }

    return file_path;
}
