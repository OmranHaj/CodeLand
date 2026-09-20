import { useEffect, useRef, useState } from "react";
import React from "react";
import { createRoot } from "react-dom/client";
import * as LucideIcons from "lucide-react";
import { transform } from "@babel/standalone";

const PREVIEW_BASE_CSS = `
  :root {
    color-scheme: dark;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background: #0b0d14;
    color: #f7f8fc;
  }

  * {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    min-height: 100%;
    margin: 0;
  }

  body {
    min-height: 100vh;
    padding: 24px;
    background:
      radial-gradient(circle at 15% 0%, rgba(255, 207, 90, 0.08), transparent 28%),
      #0b0d14;
  }

  button,
  input,
  textarea,
  select {
    font: inherit;
  }
`;

function resolveExport(moduleValue) {
  if (!moduleValue) {
    return null;
  }

  if (typeof moduleValue === "function") {
    return moduleValue;
  }

  if (typeof moduleValue.default === "function") {
    return moduleValue.default;
  }

  return null;
}

function ProjectPreviewFrame({
  code,
  css = "",
  runKey = 0,
  title = "Project preview",
  onStatusChange,
}) {
  const iframeRef = useRef(null);
  const rootRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe) {
      return undefined;
    }

    let cancelled = false;

    function report(status) {
      if (!cancelled) {
        onStatusChange?.(status);
      }
    }

    function renderPreview() {
      try {
        setError("");
        report({
          state: "running",
          message: "Compiling preview...",
        });

        const document = iframe.contentDocument;

        if (!document) {
          throw new Error("Preview document is not available.");
        }

        rootRef.current?.unmount();
        rootRef.current = null;

        document.open();

        document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1"
    />
    <style>
      ${PREVIEW_BASE_CSS}
      ${css || ""}
    </style>
  </head>

  <body>
    <div id="root"></div>
  </body>
</html>`);

        document.close();

        const result = transform(code || "", {
          filename: "CodeLandProject.jsx",

          sourceType: "module",

          presets: [
            [
              "env",
              {
                modules: "commonjs",
              },
            ],

            [
              "react",
              {
                runtime: "classic",
              },
            ],
          ],
        });

        const module = {
          exports: {},
        };

        const exports = module.exports;

        function localRequire(name) {
          if (name === "react") {
            return React;
          }

          if (name === "lucide-react") {
            return LucideIcons;
          }

          throw new Error(
            `Preview import "${name}" is not supported yet. ` +
              "Use React or lucide-react in this lab.",
          );
        }

        const execute = new Function(
          "React",
          "require",
          "module",
          "exports",
          `${result.code}
//# sourceURL=codeland-project-preview.js`,
        );

        execute(React, localRequire, module, exports);

        const PreviewComponent =
          resolveExport(module.exports) || resolveExport(exports);

        if (!PreviewComponent) {
          throw new Error(
            "No default React component was found. " +
              "Add `export default YourComponent;` to your JSX.",
          );
        }

        const mountNode = document.getElementById("root");

        if (!mountNode) {
          throw new Error("Preview mount node could not be created.");
        }

        const root = createRoot(mountNode);

        root.render(React.createElement(PreviewComponent));

        rootRef.current = root;

        report({
          state: "success",
          message: "Preview ready",
        });
      } catch (previewError) {
        console.error("[CodeLand Project Preview]", previewError);

        const message =
          previewError instanceof Error
            ? previewError.message
            : "The preview could not be rendered.";

        setError(message);

        report({
          state: "error",
          message,
        });
      }
    }

    renderPreview();

    return () => {
      cancelled = true;

      rootRef.current?.unmount();
      rootRef.current = null;
    };
  }, [code, css, runKey, onStatusChange]);

  return (
    <div
      style={{
        position: "relative",
        minHeight: 390,
        height: "100%",
      }}
    >
      <iframe
        ref={iframeRef}
        title={title}
        sandbox="allow-scripts allow-same-origin"
        style={{
          display: "block",
          width: "100%",
          minHeight: 390,
          height: "100%",
          border: 0,
          background: "#0b0d14",
        }}
      />

      {error && (
        <div
          style={{
            position: "absolute",
            inset: 14,
            overflow: "auto",
            padding: 16,

            border: "1px solid rgba(255, 109, 132, 0.28)",

            borderRadius: 12,

            color: "#ffd7de",

            background: "rgba(26, 8, 13, 0.96)",

            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",

            fontSize: 12,
            lineHeight: 1.55,
            whiteSpace: "pre-wrap",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

export default ProjectPreviewFrame;
