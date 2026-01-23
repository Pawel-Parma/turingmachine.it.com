# Turing Machine Simulator
A turing simulator website

## Dependencies:
- [TypeScript](https://www.typescriptlang.org/) compiler
- [Go](https://golang.org/)

## Usage

### 1. Clone the repository:
```bash
git clone https://github.com/Pawel-Parma/turingmachine.it.com.git
cd turingmachine.it.com
```

### 2. Compile `TypeScript` to `JavaScript`:
```bash
cd public/ts
tsc -b
```

This will create `public/js` folder containing compiled JavaScript

### 3. Start `go` server
```bash
go run .
```

The server will start on `localhost:3000` and serve from `public` folder
