package com.ruoyi.toy.domain;

import java.io.Serializable;
import java.util.Date;

/**
 * 社区点赞对象 toy_community_like
 *
 * @author Ciami
 */
public class ToyCommunityLike implements Serializable
{
    private static final long serialVersionUID = 1L;

    private Long id;

    private Long postId;

    private Long userId;

    private Date createTime;

    public Long getId()
    {
        return id;
    }

    public void setId(Long id)
    {
        this.id = id;
    }

    public Long getPostId()
    {
        return postId;
    }

    public void setPostId(Long postId)
    {
        this.postId = postId;
    }

    public Long getUserId()
    {
        return userId;
    }

    public void setUserId(Long userId)
    {
        this.userId = userId;
    }

    public Date getCreateTime()
    {
        return createTime;
    }

    public void setCreateTime(Date createTime)
    {
        this.createTime = createTime;
    }
}
