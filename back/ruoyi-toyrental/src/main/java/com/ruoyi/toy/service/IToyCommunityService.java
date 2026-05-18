package com.ruoyi.toy.service;

import com.ruoyi.toy.domain.ToyCommunityComment;
import com.ruoyi.toy.domain.ToyCommunityPost;
import java.util.List;
import java.util.Map;

/**
 * 社区Service接口
 *
 * @author Ciami
 */
public interface IToyCommunityService
{
    /**
     * 查询帖子列表
     */
    List<ToyCommunityPost> selectPostList(ToyCommunityPost post);

    /**
     * 根据ID查询帖子
     */
    ToyCommunityPost selectPostById(Long id);

    /**
     * 新增帖子
     */
    int insertPost(ToyCommunityPost post);

    /**
     * 删除帖子
     */
    int deletePostById(Long id);

    /**
     * 根据帖子ID查询评论列表
     */
    List<ToyCommunityComment> selectCommentByPostId(Long postId);

    /**
     * 新增评论
     */
    int insertComment(ToyCommunityComment comment);

    /**
     * 删除评论
     */
    int deleteCommentById(Long id);

    /**
     * 点赞/取消点赞
     */
    Map<String, Object> likePost(Long postId);
}
