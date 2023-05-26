import { type RefObject } from "react";
import {
  Avatar,
  Box,
  ButtonGroup,
  Flex,
  HStack,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorMode,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { BiSun, BiMoon, BiMenu } from "react-icons/bi";
import { BsGithub } from "react-icons/bs";

import PreferencesModal from "./PreferencesModal";
import { useUser } from "../hooks/use-user";

type HeaderProps = {
  inputPromptRef: RefObject<HTMLTextAreaElement>;
  onMenuClick: () => void;
};

function Header({ inputPromptRef, onMenuClick }: HeaderProps) {
  const { toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, login, logout } = useUser();

  return (
    <Flex
      w="100%"
      bg={useColorModeValue("white", "gray.700")}
      justify="space-between"
      align="center"
      borderBottom="2px"
      borderColor={useColorModeValue("gray.50", "gray.600")}
    >
      <HStack>
        <IconButton
          icon={<BiMenu />}
          variant="ghost"
          aria-label="Toggle Sidebar Menu"
          onClick={() => onMenuClick()}
        />
        <Text fontWeight="bold" color={useColorModeValue("blue.600", "blue.200")}>
          <Link
            href="/"
            _hover={{ textDecoration: "none", color: useColorModeValue("blue.400", "blue.100") }}
          >
            &lt;ChatCraft /&gt;
          </Link>
        </Text>
      </HStack>

      <ButtonGroup isAttached pr={2} alignItems="center">
        <IconButton
          as="a"
          href="https://github.com/tarasglek/chatcraft.org"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub Repository"
          title="GitHub Repository"
          icon={<BsGithub />}
          variant="ghost"
        />
        <IconButton
          aria-label={useColorModeValue("Switch to Dark Mode", "Switch to Light Mode")}
          title={useColorModeValue("Switch to Dark Mode", "Switch to Light Mode")}
          icon={useColorModeValue(<BiMoon />, <BiSun />)}
          variant="ghost"
          onClick={toggleColorMode}
        />

        <Box>
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="User Settings"
              title="User Settings"
              icon={
                user ? (
                  <Avatar size="xs" src={user.avatarUrl} title={user.username} />
                ) : (
                  <Avatar
                    size="xs"
                    bg="gray.500"
                    borderColor="gray.400"
                    _dark={{ bg: "gray.600", borderColor: "gray.500" }}
                    showBorder
                  />
                )
              }
              variant="ghost"
            />
            <MenuList>
              <MenuItem onClick={onOpen}>Settings...</MenuItem>
              <MenuItem onClick={user ? logout : login}>
                {user ? (
                  "Logout"
                ) : (
                  <>
                    <BsGithub /> <Text ml={2}>Sign in with GitHub</Text>
                  </>
                )}
              </MenuItem>
            </MenuList>
          </Menu>
        </Box>

        <PreferencesModal isOpen={isOpen} onClose={onClose} finalFocusRef={inputPromptRef} />
      </ButtonGroup>
    </Flex>
  );
}

export default Header;
