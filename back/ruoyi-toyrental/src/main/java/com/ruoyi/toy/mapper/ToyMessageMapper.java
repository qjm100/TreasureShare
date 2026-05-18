package com.ruoyi.toy.mapper;

import com.ruoyi.toy.domain.ToyMessage;
import java.util.List;

public interface ToyMessageMapper
{
    List<ToyMessage> selectConversations(Long userId);
    List<ToyMessage> selectMessages(Long userId, Long peerId);
    int insertMessage(ToyMessage message);
    int markRead(Long senderId, Long receiverId);
}
