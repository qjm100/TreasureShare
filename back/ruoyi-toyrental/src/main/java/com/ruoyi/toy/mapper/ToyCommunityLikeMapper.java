package com.ruoyi.toy.mapper;

import org.apache.ibatis.annotations.Param;

/**
 * 社区点赞Mapper接口
 *
 * @author Ciami
 */
public interface ToyCommunityLikeMapper
{
    /**
     * 点赞
     */
    int insertLike(@Param("postId") Long postId, @Param("userId") Long userId);

    /**
     * 取消点赞
     */
    int deleteLike(@Param("postId") Long postId, @Param("userId") Long userId);

    /**
     * 检查是否已点赞
     */
    int checkLiked(@Param("postId") Long postId, @Param("userId") Long userId);
}
