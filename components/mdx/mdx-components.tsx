import type { MDXComponents } from "mdx/types";
import TodoApp from "./todo/TodoApp";

export function getMDXComponents(
  year: string,
  month: string,
  BlogPicture: React.ComponentType<any>,
  BlogCode: React.ComponentType<any>
): MDXComponents {
  return {
    // Custom blog components
    img: (props) => <BlogPicture year={year} month={month} {...props} />,
    code: (props) => <BlogCode {...props} />,

    // MDX-specific components
    TodoApp,
  };
}
