package com.ruoyi.toy.service;

import com.ruoyi.toy.domain.ToyCart;
import java.util.List;

/**
 * 购物车Service接口
 *
 * @author Ciami
 */
public interface IToyCartService
{
    /**
     * 查询购物车列表
     */
    List<ToyCart> selectCartList();

    /**
     * 新增购物车记录
     */
    int insertCart(ToyCart cart);

    /**
     * 修改购物车记录
     */
    int updateCart(ToyCart cart);

    /**
     * 删除购物车记录
     */
    int deleteCartById(Long id);
}
