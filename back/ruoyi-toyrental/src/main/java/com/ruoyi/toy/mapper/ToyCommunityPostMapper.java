package com.ruoyi.toy.mapper;

import com.ruoyi.toy.domain.ToyCommunityPost;
import java.util.List;

/**
 * 社区帖子Mapper接口
 *
 * @author Ciami
 */
public interface ToyCommunityPostMapper
{
    /**
     * 查询帖子列表（可按昵称过滤）
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
}
