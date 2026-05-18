package com.ruoyi.toy.service;

import com.ruoyi.toy.domain.ToyUser;

/**
 * 玩具用户Service接口
 *
 * @author Ciami
 */
public interface IToyUserService
{
    /**
     * 获取当前登录用户
     */
    ToyUser getCurrentUser();

    /**
     * 修改用户信息
     */
    int updateUser(ToyUser user);

    /**
     * 根据昵称搜索用户
     */
    java.util.List<ToyUser> searchByNickName(String nickName);
}
