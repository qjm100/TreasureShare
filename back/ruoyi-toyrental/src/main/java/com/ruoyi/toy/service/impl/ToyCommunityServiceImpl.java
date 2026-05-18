package com.ruoyi.toy.service.impl;

import com.ruoyi.common.utils.SecurityUtils;
import com.ruoyi.common.utils.StringUtils;
import com.ruoyi.toy.domain.ToyCommunityComment;
import com.ruoyi.toy.domain.ToyCommunityPost;
import com.ruoyi.toy.mapper.ToyCommunityCommentMapper;
import com.ruoyi.toy.mapper.ToyCommunityLikeMapper;
import com.ruoyi.toy.mapper.ToyCommunityPostMapper;
import com.ruoyi.toy.service.IToyCommunityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 社区Service业务层处理
 *
 * @author Ciami
 */
@Service
public class ToyCommunityServiceImpl implements IToyCommunityService
{
    @Autowired
    private ToyCommunityPostMapper postMapper;

    @Autowired
    private ToyCommunityCommentMapper commentMapper;

    @Autowired
    private ToyCommunityLikeMapper likeMapper;

    /**
     * 查询帖子列表
     */
    @Override
    public List<ToyCommunityPost> selectPostList(ToyCommunityPost post)
    {
        List<ToyCommunityPost> list = postMapper.selectPostList(post);
        try
        {
            Long userId = SecurityUtils.getUserId();
            for (ToyCommunityPost p : list)
            {
                p.setLiked(likeMapper.checkLiked(p.getId(), userId) > 0);
            }
        }
        catch (Exception e)
        {
            // Anonymous access - no liked flag
        }
        return list;
    }

    /**
     * 根据ID查询帖子
     */
    @Override
    public ToyCommunityPost selectPostById(Long id)
    {
        ToyCommunityPost post = postMapper.selectPostById(id);
        if (post != null)
        {
            try
            {
                Long userId = SecurityUtils.getUserId();
                post.setLiked(likeMapper.checkLiked(post.getId(), userId) > 0);
            }
            catch (Exception e)
            {
                // Anonymous access - no liked flag
            }
        }
        return post;
    }

    /**
     * 新增帖子
     */
    @Override
    public int insertPost(ToyCommunityPost post)
    {
        post.setUserId(SecurityUtils.getUserId());
        return postMapper.insertPost(post);
    }

    /**
     * 删除帖子
     */
    @Override
    public int deletePostById(Long id)
    {
        return postMapper.deletePostById(id);
    }

    /**
     * 根据帖子ID查询评论列表
     */
    @Override
    public List<ToyCommunityComment> selectCommentByPostId(Long postId)
    {
        return commentMapper.selectCommentByPostId(postId);
    }

    /**
     * 新增评论
     */
    @Override
    public int insertComment(ToyCommunityComment comment)
    {
        comment.setUserId(SecurityUtils.getUserId());
        return commentMapper.insertComment(comment);
    }

    /**
     * 删除评论
     */
    @Override
    public int deleteCommentById(Long id)
    {
        return commentMapper.deleteCommentById(id);
    }

    /**
     * 点赞/取消点赞
     */
    @Override
    public Map<String, Object> likePost(Long postId)
    {
        Long userId = SecurityUtils.getUserId();
        int liked = likeMapper.checkLiked(postId, userId);
        if (liked > 0)
        {
            likeMapper.deleteLike(postId, userId);
        }
        else
        {
            likeMapper.insertLike(postId, userId);
        }
        // Re-fetch post to get updated like count from subquery
        ToyCommunityPost post = postMapper.selectPostById(postId);
        Map<String, Object> result = new HashMap<>();
        result.put("liked", liked <= 0);
        result.put("likeCount", post != null ? post.getLikeCount() : 0);
        return result;
    }
}
