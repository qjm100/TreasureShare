package com.ruoyi.web.controller.toy;

import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.toy.service.IToyMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/toy/messages")
public class MessageController extends BaseController
{
    @Autowired
    private IToyMessageService messageService;

    @GetMapping("/conversations")
    public AjaxResult conversations()
    {
        return success(messageService.selectConversations());
    }

    @GetMapping("/{peerId}")
    public AjaxResult history(@PathVariable Long peerId)
    {
        return success(messageService.selectMessages(peerId));
    }

    @PostMapping
    public AjaxResult send(@RequestBody Map<String, Object> body)
    {
        Long receiverId = Long.valueOf(body.get("receiverId").toString());
        String content = (String) body.get("content");
        return success(messageService.sendMessage(receiverId, content));
    }
}
