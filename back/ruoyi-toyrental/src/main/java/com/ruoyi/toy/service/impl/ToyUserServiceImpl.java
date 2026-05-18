package com.ruoyi.toy.service.impl;

import com.ruoyi.common.utils.SecurityUtils;
import com.ruoyi.toy.domain.ToyUser;
import com.ruoyi.toy.mapper.ToyUserMapper;
import com.ruoyi.toy.service.IToyUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * 玩具用户Service业务层处理
 *
 * @author Ciami
 */
@Service
public class ToyUserServiceImpl implements IToyUserService
{
    @Autowired
    private ToyUserMapper userMapper;

    /**
     * 获取当前登录用户
     */
    @Override
    public ToyUser getCurrentUser()
    {
        Long userId = SecurityUtils.getUserId();
        ToyUser user = userMapper.selectUserByUserId(userId);
        if (user == null)
        {
            user = new ToyUser();
            user.setUserId(userId);
            user.setNickName(SecurityUtils.getUsername());
            user.setCreditScore(600);
            user.setCreateBy(SecurityUtils.getUsername());
            userMapper.insertUser(user);
            user = userMapper.selectUserByUserId(userId);
        }
        return user;
    }

    /**
     * 修改用户信息
     */
    @Override
    public int updateUser(ToyUser user)
    {
        ToyUser existing = userMapper.selectUserByUserId(SecurityUtils.getUserId());
        if (existing != null)
        {
            user.setId(existing.getId());
        }
        return userMapper.updateUser(user);
    }

    @Override
    public java.util.List<ToyUser> searchByNickName(String nickName)
    {
        Long currentUserId = SecurityUtils.getUserId();
        java.util.List<ToyUser> list = userMapper.selectUserByNickName(nickName);
        list.removeIf(u -> currentUserId.equals(u.getUserId()));
        return list;
    }
}
