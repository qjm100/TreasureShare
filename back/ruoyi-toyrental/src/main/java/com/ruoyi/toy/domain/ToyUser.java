package com.ruoyi.toy.domain;

import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 玩具用户对象 toy_user
 *
 * @author Ciami
 */
public class ToyUser extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    private Long id;

    private Long userId;

    private String nickName;

    private String avatar;

    private Integer creditScore;

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

    public Integer getCreditScore()
    {
        return creditScore;
    }

    public void setCreditScore(Integer creditScore)
    {
        this.creditScore = creditScore;
    }
}
