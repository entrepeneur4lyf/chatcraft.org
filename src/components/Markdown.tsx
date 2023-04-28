import { memo, type ReactNode } from "react";
import {
  Flex,
  ButtonGroup,
  IconButton,
  useToast,
  useClipboard,
  useColorModeValue,
  Text,
  Box,
} from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import remarkMermaid from "remark-mermaidjs";
import remarkGfm from "remark-gfm";
import { TbCopy, TbDownload } from "react-icons/tb";

import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
// We need both a light and dark theme
import oneDark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
import oneLight from "react-syntax-highlighter/dist/esm/styles/prism/one-light";

type PreHeaderProps = { language: string; children: ReactNode; code: string };

function PreHeader({ language, children, code }: PreHeaderProps) {
  const { onCopy } = useClipboard(code);
  const toast = useToast();

  const handleCopy = () => {
    onCopy();
    toast({
      title: "Copied to Clipboard",
      description: "Code was copied to your clipboard.",
      status: "info",
      duration: 3000,
      position: "top",
      isClosable: true,
    });
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.setAttribute("download", "code.txt");
    anchor.setAttribute("href", url);
    anchor.click();

    toast({
      title: "Downloaded",
      description: "Code was downloaded as a file",
      status: "info",
      duration: 3000,
      position: "top",
      isClosable: true,
    });
  };

  return (
    <>
      <Flex
        bg={useColorModeValue("gray.200", "gray.600")}
        alignItems="center"
        justify="space-between"
        align="center"
        borderTopLeftRadius="md"
        borderTopRightRadius="md"
      >
        <Box pl={2}>
          <Text as="code" fontSize="xs">
            {language}
          </Text>
        </Box>
        <ButtonGroup isAttached pr={2}>
          <IconButton
            size="sm"
            aria-label="Download code"
            title="Download code"
            icon={<TbDownload />}
            color="gray.600"
            _dark={{ color: "gray.300" }}
            variant="ghost"
            onClick={handleDownload}
          />
          <IconButton
            size="sm"
            aria-label="Copy to Clipboard"
            title="Copy to Clipboard"
            icon={<TbCopy />}
            color="gray.600"
            _dark={{ color: "gray.300" }}
            variant="ghost"
            onClick={handleCopy}
          />
        </ButtonGroup>
      </Flex>
      {children}
    </>
  );
}

const fixLanguage = (language: string | null) => {
  if (!language) {
    return "text";
  }

  // Allow for common short-forms, but map back to known language names
  switch (language) {
    case "js":
      return "javascript";
    case "ts":
      return "typescript";
    case "yml":
      return "yaml";
    default:
      return language;
  }
};

type MarkdownProps = {
  previewCode?: boolean;
  children: string;
};

const Markdown = ({ previewCode, children }: MarkdownProps) => {
  const style = useColorModeValue(oneLight, oneDark);

  return (
    <ReactMarkdown
      className="message-text"
      children={children}
      remarkPlugins={previewCode ? [remarkGfm, remarkMermaid] : []}
      components={{
        code({ inline, className, children, ...props }) {
          if (inline) {
            return (
              <code className="inline-code" {...props}>
                {children}
              </code>
            );
          }

          // Look for named code fences (e.g., `language-html`)
          const match = /language-(\w+)/.exec(className || "");
          const language = fixLanguage(match && match[1]);

          // Include rendered versions of some code blocks before the code
          let prefix = <></>;
          if (previewCode === undefined || previewCode === true) {
            if (language === "mermaid") {
              prefix = <div className="mermaid">{children}</div>;
            } else if (language === "html") {
              prefix = <iframe className="htmlPreview" srcDoc={children as any}></iframe>;
            }
          }
          const code = String(children);

          return (
            <>
              {prefix}
              <SyntaxHighlighter
                children={code}
                language={language}
                PreTag={(props) => <PreHeader {...props} code={code} language={language} />}
                style={style}
                showLineNumbers={true}
                wrapLines={true}
              />
            </>
          );
        },
      }}
    />
  );
};

// Don't re-render Markdown unless we have to
export default memo(Markdown);
