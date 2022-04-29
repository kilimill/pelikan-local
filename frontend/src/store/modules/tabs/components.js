// Tabs components
import TabContent from "@/components/tabs/TabContent"
import TabVideo from "@/components/tabs/TabVideo"
import TabChat from "@/components/tabs/chat"
import TabUsers from "@/components/tabs/users"
import TabInfo from "@/components/tabs/info"
import TabSettings from "@/components/tabs/settings"

export default {
    [TabContent.name]: TabContent,
    [TabVideo.name]: TabVideo,
    [TabChat.name]: TabChat,
    [TabUsers.name]: TabUsers,
    [TabSettings.name]: TabSettings,
    [TabInfo.name]: TabInfo,
}