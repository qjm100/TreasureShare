package com.ruoyi.toy.mapper;

import com.ruoyi.toy.domain.ToyUser;

/**
 * 玩具用户Mapper接口
 *
 * @author Ciami
 */
public interface ToyUserMapper
{
    /**
     * 根据用户ID查询玩具用户
     */
    ToyUser selectUserByUserId(Long userId);

    /**
     * 新增玩具用户
     */
    int insertUser(ToyUser user);

    /**
     * 根据昵称搜索用户
     */
    java.util.List<ToyUser> selectUserByNickName(String nickName);

    /**
     * 修改玩具用户
     */
    int updateUser(ToyUser user);
}
