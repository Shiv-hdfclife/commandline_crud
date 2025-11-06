#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

// Get CLI arguments
const [,, command, fileName, ...args] = process.argv;

// Helper to get file path in project root
const getFilePath = (f) => path.join(__dirname, f);

// Utility: read file lines (safe)
const readLines = (file) => {
  if (!fs.existsSync(file)) return null;
  const data = fs.readFileSync(file, "utf8").trim();
  return data ? data.split("\n") : [];
};

// Utility: write lines safely
const writeLines = (file, lines) => {
  fs.writeFileSync(file, lines.join("\n"), "utf8");
};

// ---- Command Handlers ---- //

function readFile(file) {
  const lines = readLines(file);
  if (!lines) return console.log(`No file found: ${path.basename(file)}`);
  if (lines.length === 0) return console.log(`File is empty.`);
  lines.forEach((line, i) => console.log(`${i + 1}. ${line}`));
}

function listFile(file) {
  const lines = readLines(file);
  if (!lines) return console.log(`No file found: ${path.basename(file)}`);
  if (lines.length === 0) return console.log(`File is empty.`);
  lines.forEach((line, i) => console.log(`${i + 1}. ${line}`));
  console.log(`\nTotal records: ${lines.length}`);
}

function createRecord(file, text) {
  const fileExists = fs.existsSync(file);
  let lines = fileExists ? readLines(file) : [];
  lines.push(text);
  writeLines(file, lines);
  console.log(`Created record #${lines.length}`);
}

function updateRecord(file, index, newText) {
  let lines = readLines(file);
  if (!lines) return console.log(`No file found: ${path.basename(file)}`);
  index = Number(index);
  if (index < 1 || index > lines.length) {
    return console.log(`Record #${index} not found.`);
  }
  lines[index - 1] = newText;
  writeLines(file, lines);
  console.log(`Updated record #${index}`);
}

function deleteRecord(file, index) {
  let lines = readLines(file);
  if (!lines) return console.log(`No file found: ${path.basename(file)}`);
  index = Number(index);
  if (index < 1 || index > lines.length) {
    return console.log(`Record #${index} not found.`);
  }
  lines.splice(index - 1, 1);
  writeLines(file, lines);
  console.log(`Deleted record #${index}`);
}

// ---- Auth Commands ---- //

function registerUser(email, password) {
  const file = getFilePath("users.txt");
  const users = readLines(file) || [];
  const existing = users.find(line => {
    try {
      const user = JSON.parse(line);
      return user.email === email;
    } catch { return false; }
  });

  if (existing) {
    console.log("User already exists");
    process.exit(1);
  }

  const newUser = JSON.stringify({ email, password });
  fs.appendFileSync(file, newUser + "\n");
  console.log(`Registered ${email}`);
}

function loginUser(email, password) {
  const file = getFilePath("users.txt");
  if (!fs.existsSync(file)) {
    console.log("No users registered yet.");
    process.exit(1);
  }

  const users = readLines(file);
  const user = users.find(line => {
    try {
      const u = JSON.parse(line);
      return u.email === email && u.password === password;
    } catch { return false; }
  });

  if (user) {
    console.log("Login successful");
    process.exit(0);
  } else {
    console.log("Invalid credentials");
    process.exit(1);
  }
}

// ---- Command Dispatcher ---- //

const filePath = fileName ? getFilePath(fileName) : null;

switch (command) {
  case "read":
    readFile(filePath);
    break;
  case "list":
    listFile(filePath);
    break;
  case "create":
    createRecord(filePath, args.join(" "));
    break;
  case "update":
    updateRecord(filePath, args[0], args.slice(1).join(" "));
    break;
  case "delete":
    deleteRecord(filePath, args[0]);
    break;
  case "register":
    registerUser(fileName, args[0]);
    break;
  case "login":
    loginUser(fileName, args[0]);
    break;
  default:
    console.log(`
Usage:
  node index.js read data.txt
  node index.js list data.txt
  node index.js create data.txt "some text"
  node index.js update data.txt 3 "new text"
  node index.js delete data.txt 2
  node index.js register email password
  node index.js login email password
    `);
}
