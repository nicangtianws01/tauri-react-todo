// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
// mod file_db;

// use file_db::Database;

mod sqlite_db;

use sqlite_db::Database;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}


#[tauri::command]
fn init_todo(status: &str) -> String {
    let db = Database::open();
    return db.list(status);
}

#[tauri::command]
fn add_todo(todo: &str) -> String {
    let db = Database::open();
    return db.add(todo);
}

#[tauri::command]
fn remove_todo(_id: i32) -> String {
    let db = Database::open();
    return db.remove(_id);
}

#[tauri::command]
fn mark_todo(_id: i32, status: &str) -> String {
    let db = Database::open();
    return db.mark(_id, status);
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, init_todo, add_todo, remove_todo, mark_todo])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
