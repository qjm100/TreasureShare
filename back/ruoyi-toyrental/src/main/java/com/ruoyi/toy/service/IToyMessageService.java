package com.ruoyi.toy.service;

import com.ruoyi.toy.domain.ToyMessage;
import java.util.List;

public interface IToyMessageService
{
    List<ToyMessage> selectConversations();
    List<ToyMessage> selectMessages(Long peerId);
    int sendMessage(Long receiverId, String content);
}
