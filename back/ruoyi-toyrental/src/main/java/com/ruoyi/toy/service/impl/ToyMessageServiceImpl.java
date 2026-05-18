package com.ruoyi.toy.service.impl;

import com.ruoyi.common.utils.SecurityUtils;
import com.ruoyi.toy.domain.ToyMessage;
import com.ruoyi.toy.mapper.ToyMessageMapper;
import com.ruoyi.toy.service.IToyMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ToyMessageServiceImpl implements IToyMessageService
{
    @Autowired
    private ToyMessageMapper messageMapper;

    @Override
    public List<ToyMessage> selectConversations()
    {
        Long userId = SecurityUtils.getUserId();
        List<ToyMessage> list = messageMapper.selectConversations(userId);
        for (ToyMessage msg : list)
        {
            // SQL already normalizes senderName/senderAvatar to the peer.
            // If current user is the sender of the latest message, swap senderId
            // so the frontend gets the correct peer ID for the conversation.
            if (msg.getSenderId().equals(userId))
            {
                msg.setSenderId(msg.getReceiverId());
            }
        }
        return list;
    }

    @Override
    public List<ToyMessage> selectMessages(Long peerId)
    {
        Long userId = SecurityUtils.getUserId();
        // Mark messages as read
        messageMapper.markRead(peerId, userId);
        return messageMapper.selectMessages(userId, peerId);
    }

    @Override
    public int sendMessage(Long receiverId, String content)
    {
        ToyMessage msg = new ToyMessage();
        msg.setSenderId(SecurityUtils.getUserId());
        msg.setReceiverId(receiverId);
        msg.setContent(content);
        return messageMapper.insertMessage(msg);
    }
}
