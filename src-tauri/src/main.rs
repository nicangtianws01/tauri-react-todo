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
fn init_todo(kw: &str) -> String {
    let db = Database::open();
    return db.list(kw);
}

#[tauri::command]
fn add_todo(todo: &str, tag: &str) -> String {
    let db = Database::open();
    return db.add(todo, tag);
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

#[tauri::command]
fn update_todo(_id: i32, title: &str) -> String {
    let db = Database::open();
    return db.update(_id, title);
}

#[tauri::command]
fn add_tag(name: &str) -> String {
    let db = Database::open();
    return db.add_tag(name);
}

#[tauri::command]
fn update_tag(_id: i32, name: &str) -> String {
    let db = Database::open();
    return db.update_tag(_id, name);
}

#[tauri::command]
fn del_tag(_id: i32) -> String {
    let db = Database::open();
    return db.del_tag(_id);
}

#[tauri::command]
fn list_tag() -> String {
    let db = Database::open();
    return db.list_tag();
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            init_todo,
            add_todo,
            remove_todo,
            mark_todo,
            update_todo,
            add_tag,
            list_tag,
            update_tag,
            del_tag
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
