"use client";

import * as React from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Isolates a single section so a runtime error in one part of the page
 * cannot blank the entire homepage. Renders a lightweight fallback instead.
 */
export class SectionBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("SectionBoundary caught an error:", error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            تعذّر تحميل هذا القسم مؤقتاً. يرجى تحديث الصفحة.
          </div>
        )
      );
    }
    return this.props.children;
  }
}
