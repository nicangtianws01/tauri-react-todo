// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs::{create_dir, File, OpenOptions};
use std::io::{self, BufRead, BufWriter, Write};
use std::path::Path;
use dirs2::home_dir;

const TODO_DIR: &str = "Documents\\TauriTodo";
const TODO_FILE: &str = "todo.txt";

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn save_todo(todo: &str) -> String {
    let binding = home_dir().expect("error find home dir");
    let home = binding.to_str().expect("error find home dir");
    let path = format!("{}\\{}\\{}", home, TODO_DIR, TODO_FILE);
    let f = OpenOptions::new()
        .write(true)
        .append(true)
        .open(path)
        .expect("error open file");
    let mut writer = BufWriter::new(f);
    writer
        .write(format!("{}\n", todo).as_bytes())
        .expect("error save todo");

    return todo.to_string();
}

#[tauri::command]
fn init_todo() -> String {
    let binding = home_dir().expect("error find home dir");
    let home = binding.to_str().expect("error find home di");
    let dir_path = format!("{}\\{}", home, TODO_DIR);
    let dir = dir_path.as_str();
    let exists_dir = Path::new(dir).is_dir();
    if !exists_dir {
        create_dir(dir).expect("error create dir");
    }

    let file_path = format!("{}\\{}", dir_path, TODO_FILE);
    let path = file_path.as_str();
    let exists = Path::new(path).is_file();
    if !exists {
        File::create_new(path).expect("error create file");
        return "[]".to_string();
    }

    let f = OpenOptions::new()
        .read(true)
        .open(path)
        .expect("error open file");

    let reader = io::BufReader::new(f);

    let mut contents: Vec<String> = reader
        .lines()
        .map(|l| l.expect("could not parse line"))
        .collect();

    contents.reverse();

    return serde_json::to_string(&contents).expect("[]");
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            save_todo,
            init_todo,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
