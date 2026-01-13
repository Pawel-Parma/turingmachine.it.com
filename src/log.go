package src

import (
	"io"
	"log"
	"log/slog"
	"os"
)

var Log *slog.Logger
var logFile *os.File

func InitLogger(config *Config) {
	logFile, err := os.OpenFile(config.Log.File, os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatalf("failed to open log file %s: %v", config.Log.File, err)
	}
	output := io.MultiWriter(logFile, os.Stdout)

	var level slog.Level
	switch config.Log.Level {
	case "debug":
		level = slog.LevelDebug
	case "info":
		level = slog.LevelInfo
	case "warn":
		level = slog.LevelWarn
	case "error":
		level = slog.LevelError
	default:
		log.Fatalf("log/level may be one of: 'debug', 'info', 'warn', 'error', found: %s\n", config.Log.Level)
	}

	var handler slog.Handler
	switch config.Log.Format {
	case "pretty":
		handler = NewPrettyHandler(output, level, config.Log.AddSource)
	case "json":
		handler = slog.NewJSONHandler(output, &slog.HandlerOptions{
			Level:     level,
			AddSource: config.Log.AddSource,
		})
	case "text":
		handler = slog.NewTextHandler(output, &slog.HandlerOptions{
			Level:     level,
			AddSource: config.Log.AddSource,
		})
	default:
		log.Fatalf("log/format may be one of: 'pretty', 'json', 'text', found: %s\n", config.Log.Level)
	}

	Log = slog.New(handler)
	slog.SetDefault(Log)
}

func DeinitLogger() {
	if logFile != nil {
		logFile.Close()
	}
}
