// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod file_db;

use file_db::Database;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}


#[tauri::command]
fn init_todo() -> String {
    let db = Database::open(true);
    return db.list();
}

#[tauri::command]
fn add_todo(todo: &str) -> String {
    let db = Database::open(true);
    return db.add(todo);
}

#[tauri::command]
fn remove_todo(id: u8) -> String {
    let db = Database::open(false);
    return db.remove(id);
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, init_todo, add_todo, remove_todo])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
