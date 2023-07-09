import { memo, useCallback, type ReactNode } from "react";
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
import { TbCopy, TbDownload, TbRun } from "react-icons/tb";

import { download } from "../lib/utils";

type PreHeaderProps = {
  language: string;
  children: ReactNode;
  isLoading: boolean;
  onPrompt?: (prompt: string) => void;
  code: string;
};

function CodeHeader({ language, children, isLoading, onPrompt, code }: PreHeaderProps) {
  const { onCopy } = useClipboard(code);
  const toast = useToast();
  // Only show the "Run" button for JS code blocks, and only when we aren't already loading
  const shouldShowRunButton = (language === "js" || language === "javascript") && onPrompt;

  const handleCopy = useCallback(() => {
    onCopy();
    toast({
      title: "Copied to Clipboard",
      description: "Code was copied to your clipboard.",
      status: "info",
      duration: 3000,
      position: "top",
      isClosable: true,
    });
  }, [onCopy, toast]);

  const handleDownload = useCallback(() => {
    download(code, "code.txt");
    toast({
      title: "Downloaded",
      description: "Code was downloaded as a file",
      status: "info",
      duration: 3000,
      position: "top",
      isClosable: true,
    });
  }, [toast, code]);

  const handleRun = useCallback(async () => {
    if (!onPrompt) {
      return;
    }

    const toCodeBlock = (text: string, language = "") => "```" + language + "\n" + text + "\n```";

    let ret = undefined;
    try {
      // We're doing eval() here, but rollup doesn't like it, so use `new Function()`
      const fn = new Function(code);
      let result = fn();
      if (result instanceof Promise) {
        result = await result;
      }
      if (typeof result !== "string") {
        result = toCodeBlock(JSON.stringify(result), "json");
      }
      // let js decide how to render the result
      ret = result;
    } catch (error: any) {
      ret = toCodeBlock(
        error instanceof Error ? `${error.name}: ${error.message}\n${error.stack}` : `${error}`
      );
    }
    onPrompt(ret);
  }, [onPrompt, code]);

  return (
    <>
      <Flex
        bg={useColorModeValue("gray.200", "gray.600")}
        alignItems="center"
        justify="space-between"
        align="center"
        mb={2}
      >
        <Box pl={2}>
          <Text as="code" fontSize="xs">
            {language}
          </Text>
        </Box>
        <ButtonGroup isAttached pr={2}>
          {shouldShowRunButton && (
            <IconButton
              size="sm"
              aria-label="Run code"
              title="Run code"
              icon={<TbRun />}
              color="gray.600"
              _dark={{ color: "gray.300" }}
              variant="ghost"
              onClick={handleRun}
              isDisabled={isLoading}
            />
          )}
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

export default memo(CodeHeader);
