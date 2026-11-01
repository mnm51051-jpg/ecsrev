import { useEffect, useState } from "react";
import { createContainer } from "unstated-next";
import request from "../lib/request";
import { getRobux } from "../services/economy";
import { getFriendRequestCount } from "../services/friends";
import { getUnreadMessageCount } from "../services/privateMessages";
import { getInboundTradeCount } from "../services/trades";
import { getMyInfo } from "../services/users";

const AuthenticationStore = createContainer(() => {
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPending, setIsPending] = useState(true);
  const [robux, setRobux] = useState(null);
  const [tix, setTix] = useState(null);
  const [notificationCount, setNotificationCount] = useState({
    messages: 0,
    trades: 0,
    friendRequests: 0,
  })

  useEffect(() => {
    getMyInfo().then(result => {
      if (typeof result === 'string') {
        throw new Error('Unexpected Response');
      }
      setUserId(result.id);
      setUsername(result.name);
      setIsAuthenticated(true);
      setIsPending(false);
    }).catch(() => {
      setIsPending(false);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    // Get Robux
    getRobux({ userId }).then((data) => {
      setRobux(data.robux || 0);
      setTix(data.tickets || 0);
    }).catch(() => {
      setRobux(null);
      setTix(null);
    });
    // Get notifications
    Promise.all([
      getInboundTradeCount().catch(() => 0),
      getUnreadMessageCount().catch(() => 0),
      getFriendRequestCount().catch(() => 0),
    ]).then(([inboundTradeCount, messageCount, friendRequestCount]) => {
      setNotificationCount({
        messages: messageCount,
        friendRequests: friendRequestCount,
        trades: inboundTradeCount,
      });
    });
  }, [userId]);

  return {
    userId,
    username,
    isAuthenticated,
    isPending,

    robux,
    tix,

    notificationCount,
  }
});

export default AuthenticationStore;
