package com.ruoyi.web.controller.toy;

import com.ruoyi.common.annotation.Anonymous;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.core.page.TableDataInfo;
import com.ruoyi.toy.domain.ToyCommunityComment;
import com.ruoyi.toy.domain.ToyCommunityPost;
import com.ruoyi.toy.service.IToyCommunityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * 社区Controller
 *
 * @author Ciami
 */
@RestController
@RequestMapping("/api/toy/community")
public class CommunityController extends BaseController
{
    @Autowired
    private IToyCommunityService communityService;

    /**
     * 获取帖子列表
     */
    @Anonymous
    @GetMapping("/posts")
    public Object listPosts(ToyCommunityPost post, HttpServletRequest request)
    {
        if (request.getParameter("pageNum") != null)
        {
            startPage();
            List<ToyCommunityPost> list = communityService.selectPostList(post);
            return getDataTable(list);
        }
        return success(communityService.selectPostList(post));
    }

    /**
     * 获取帖子详细信息
     */
    @Anonymous
    @GetMapping("/posts/{id}")
    public AjaxResult getPost(@PathVariable Long id)
    {
        return success(communityService.selectPostById(id));
    }

    /**
     * 新增帖子
     */
    @PostMapping("/posts")
    public AjaxResult addPost(@RequestBody ToyCommunityPost post)
    {
        return toAjax(communityService.insertPost(post));
    }

    /**
     * 删除帖子
     */
    @DeleteMapping("/posts/{id}")
    public AjaxResult removePost(@PathVariable Long id)
    {
        return toAjax(communityService.deletePostById(id));
    }

    /**
     * 获取评论列表
     */
    @Anonymous
    @GetMapping("/comments/{postId}")
    public AjaxResult listComments(@PathVariable Long postId)
    {
        return success(communityService.selectCommentByPostId(postId));
    }

    /**
     * 新增评论
     */
    @PostMapping("/comment")
    public AjaxResult addComment(@RequestBody ToyCommunityComment comment)
    {
        return toAjax(communityService.insertComment(comment));
    }

    /**
     * 删除评论
     */
    @DeleteMapping("/comment/{id}")
    public AjaxResult removeComment(@PathVariable Long id)
    {
        return toAjax(communityService.deleteCommentById(id));
    }

    /**
     * 点赞/取消点赞
     */
    @PostMapping("/like/{postId}")
    public AjaxResult like(@PathVariable Long postId)
    {
        return success(communityService.likePost(postId));
    }
}
