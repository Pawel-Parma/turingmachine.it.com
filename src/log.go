package src

import (
	"log"
	"log/slog"
	"os"
)

var Log *slog.Logger

// TODO: add logging to a file
func InitLogger(config *Config) {
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
		handler = NewPrettyHandler(os.Stdout, level, config.Log.AddSource)
	case "json":
		handler = slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
			Level:     level,
			AddSource: config.Log.AddSource,
		})
	case "text":
		handler = slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
			Level:     level,
			AddSource: config.Log.AddSource,
		})
	default:
		log.Fatalf("log/format may be one of: 'pretty', 'json', 'text', found: %s\n", config.Log.Level)
	}

	Log = slog.New(handler)
	slog.SetDefault(Log)
}
