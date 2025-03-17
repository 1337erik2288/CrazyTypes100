export const codeLines = {
  javascript: [
    'const sum = (a, b) => a + b;',
    'let counter = 0;',
    'console.log("Hello, World!");',
    'const numbers = [1, 2, 3, 4, 5];',
    'const user = { name: "John", age: 30 };',
    'function greet(name) { return `Hello, ${name}!`; }',
    'array.forEach(item => console.log(item));',
    'const result = numbers.map(x => x * 2);',
    'const filtered = array.filter(x => x > 0);',
    'localStorage.setItem("key", "value");'
  ],
  typescript: [
    'interface User { id: number; name: string; }',
    'type Point = { x: number; y: number; };',
    'const age: number = 25;',
    'function add(a: number, b: number): number { return a + b; }',
    'const items: string[] = ["apple", "banana"];',
    'class Animal { constructor(name: string) { this.name = name; } }',
    'const status: "active" | "inactive" = "active";',
    'const handler = (event: MouseEvent): void => { };',
    'let count: number | null = null;',
    'const getValue = <T>(value: T): T => value;'
  ],
  python: [
    'def greet(name: str) -> str: return f"Hello {name}!"',
    'numbers = [1, 2, 3, 4, 5]',
    'squares = [x**2 for x in range(10)]',
    'class Point: def __init__(self, x, y): self.x, self.y = x, y',
    'with open("file.txt", "r") as f: content = f.read()',
    'try: result = 10/0\nexcept ZeroDivisionError: pass',
    'from typing import List, Optional',
    'def factorial(n: int) -> int: return 1 if n <= 1 else n * factorial(n-1)',
    'lambda x: x * 2',
    'if __name__ == "__main__": main()'
  ],
  rust: [
    'let mut count = 0;',
    'fn add(a: i32, b: i32) -> i32 { a + b }',
    'let numbers: Vec<i32> = vec![1, 2, 3];',
    'struct Point { x: f64, y: f64 }',
    '#[derive(Debug)]',
    'impl ToString for User { }',
    'match value { Some(x) => x, None => 0 }',
    'let result = Ok(42).unwrap_or(0);',
    'pub fn process(input: &str) -> String { input.to_string() }',
    'type Result<T> = std::result::Result<T, Error>;'
  ]
};