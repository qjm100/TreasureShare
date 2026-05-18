package com.ruoyi.toy.mapper;

import com.ruoyi.toy.domain.ToyCart;
import java.util.List;

/**
 * 购物车Mapper接口
 *
 * @author Ciami
 */
public interface ToyCartMapper
{
    /**
     * 查询用户的购物车列表
     */
    List<ToyCart> selectCartList(Long userId);

    /**
     * 根据ID查询购物车记录
     */
    ToyCart selectCartById(Long id);

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

    /**
     * 查询用户是否已添加该商品到购物车（查重）
     */
    ToyCart selectCartByUserAndProduct(ToyCart cart);
}
