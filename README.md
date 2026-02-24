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

### 2. Run the application:
```bash
./run.sh
```

#### Manual setup

### 1. Compile `TypeScript` to `JavaScript`:
```bash
cd public/ts
tsc -b
```

This will create `public/js` folder containing compiled JavaScript

### 2. Start `go` server
```bash
cd ../..
go run .
```

The server will start on `localhost:3000` and serve content from `public` folder
