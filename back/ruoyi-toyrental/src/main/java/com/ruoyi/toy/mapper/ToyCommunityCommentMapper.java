package com.ruoyi.toy.mapper;

import com.ruoyi.toy.domain.ToyCommunityComment;
import java.util.List;

/**
 * 社区评论Mapper接口
 *
 * @author Ciami
 */
public interface ToyCommunityCommentMapper
{
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
}
