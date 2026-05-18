package com.ruoyi.toy.domain;

import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 社区帖子对象 toy_community_post
 *
 * @author Ciami
 */
public class ToyCommunityPost extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    private Long id;

    private Long userId;

    private String content;

    private String images;

    private String nickName;

    private String avatar;

    private Integer likeCount;

    private Integer commentCount;

    private Boolean liked;

    public Long getId()
    {
        return id;
    }

    public void setId(Long id)
    {
        this.id = id;
    }

    public Long getUserId()
    {
        return userId;
    }

    public void setUserId(Long userId)
    {
        this.userId = userId;
    }

    public String getContent()
    {
        return content;
    }

    public void setContent(String content)
    {
        this.content = content;
    }

    public String getImages()
    {
        return images;
    }

    public void setImages(String images)
    {
        this.images = images;
    }

    public String getNickName()
    {
        return nickName;
    }

    public void setNickName(String nickName)
    {
        this.nickName = nickName;
    }

    public String getAvatar()
    {
        return avatar;
    }

    public void setAvatar(String avatar)
    {
        this.avatar = avatar;
    }

    public Integer getLikeCount()
    {
        return likeCount;
    }

    public void setLikeCount(Integer likeCount)
    {
        this.likeCount = likeCount;
    }

    public Integer getCommentCount()
    {
        return commentCount;
    }

    public void setCommentCount(Integer commentCount)
    {
        this.commentCount = commentCount;
    }

    public Boolean getLiked()
    {
        return liked;
    }

    public void setLiked(Boolean liked)
    {
        this.liked = liked;
    }
}
