import { Box, Flex, VStack, Heading, Text } from "@chakra-ui/react";
import { useLiveQuery } from "dexie-react-hooks";
import { MdOutlineChatBubbleOutline } from "react-icons/md";
import { TbShare2 } from "react-icons/tb";

import db from "../lib/db";
import { Link } from "react-router-dom";

function SidebarItem({ text, url }: { text: string; url: string }) {
  return (
    <Link to={url}>
      <Flex gap={2} pr={6}>
        <Box mt={1}>
          <MdOutlineChatBubbleOutline />
        </Box>
        <Box flex={1} maxW="100%">
          <Text noOfLines={4} fontSize="sm" title={text}>
            {text}
          </Text>
        </Box>
      </Flex>
    </Link>
  );
}

function Sidebar() {
  const sharedChats = useLiveQuery(async () => {
    const chats = await db.chats.orderBy("date").toArray();
    return chats.filter((chat) => chat.isPublic);
  });

  return (
    <Flex direction="column" h="100%" p={4} gap={2}>
      <Box>
        <Flex align="center" gap={1}>
          <Heading as="h3" size="sm">
            Shared Chats
          </Heading>
        </Flex>
      </Box>

      <>
        {sharedChats?.length ? (
          sharedChats.map(({ id, summary }) => (
            <SidebarItem key={id} text={summary} url={`/c/${id}`} />
          ))
        ) : (
          <VStack align="left">
            <Text>You don&apos;t have any shared chats.</Text>
            <Text>
              Share your first chat by clicking the <strong>Share</strong> button ({" "}
              <Box
                display="inline-block"
                as="span"
                w="1.3em"
                verticalAlign="middle"
                color="blue.600"
                _dark={{ color: "blue.200" }}
              >
                <TbShare2 />
              </Box>
              ) to create a <strong>public URL</strong>. Anyone with this URL will be able to read
              or fork the chat.
            </Text>
          </VStack>
        )}
      </>
    </Flex>
  );
}

export default Sidebar;
