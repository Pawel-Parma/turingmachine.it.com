package src

import (
	"context"
	"io"
	"log/slog"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
)

const logTimeFormat = "2006-01-02-15-04-05"

type PrettyHandler struct {
	out   io.Writer
	level slog.Level
	attrs []slog.Attr
	// TODO: write groups
	groups    []string
	addSource bool
}

func NewPrettyHandler(out io.Writer, level slog.Level, addSource bool) *PrettyHandler {
	return &PrettyHandler{
		out:       out,
		level:     level,
		addSource: addSource,
	}
}

func (h *PrettyHandler) Handle(_ context.Context, r slog.Record) error {
	var sb strings.Builder

	sb.WriteString("[")
	sb.WriteString(r.Level.String())
	sb.WriteString("]")

	sb.WriteString(" ")
	sb.WriteString(r.Time.Format(logTimeFormat))
	sb.WriteString(" ")

	if h.addSource && r.PC != 0 {
		frame, _ := runtime.CallersFrames([]uintptr{r.PC}).Next()
		sb.WriteString("(")
		sb.WriteString(filepath.Base(frame.File))
		sb.WriteString(":")
		sb.WriteString(strconv.Itoa(frame.Line))
		sb.WriteString(")")
	}
	sb.WriteString(" | ")

	sb.WriteString(r.Message)

	for _, a := range h.attrs {
		_ = writeAttr(&sb, a)
	}

	r.Attrs(func(a slog.Attr) bool {
		return writeAttr(&sb, a)
	})

	sb.WriteString("\n")

	_, err := h.out.Write([]byte(sb.String()))
	return err
}

func (h *PrettyHandler) Enabled(_ context.Context, lvl slog.Level) bool {
	return lvl >= h.level
}

func (h *PrettyHandler) WithAttrs(attrs []slog.Attr) slog.Handler {
	cp := *h
	cp.attrs = append(cp.attrs, attrs...)
	return &cp
}

func (h *PrettyHandler) WithGroup(name string) slog.Handler {
	cp := *h
	cp.groups = append(cp.groups, name)
	return &cp
}

func writeAttr(sb *strings.Builder, a slog.Attr) bool {
	v := a.Value.Resolve()
	if a.Key == "" {
		return true
	}

	sb.WriteString(" | ")
	sb.WriteString(a.Key)
	sb.WriteString(" = ")

	switch a.Value.Kind() {
	case slog.KindString:
		sb.WriteString("\"")
		sb.WriteString(v.String())
		sb.WriteString("\"")
	default:
		sb.WriteString(a.Value.String())
	}

	return true
}
