package com.ruoyi.toy.service.impl;

import com.ruoyi.common.utils.SecurityUtils;
import com.ruoyi.toy.domain.ToyCart;
import com.ruoyi.toy.mapper.ToyCartMapper;
import com.ruoyi.toy.service.IToyCartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * 购物车Service业务层处理
 *
 * @author Ciami
 */
@Service
public class ToyCartServiceImpl implements IToyCartService
{
    @Autowired
    private ToyCartMapper cartMapper;

    /**
     * 查询购物车列表
     */
    @Override
    public List<ToyCart> selectCartList()
    {
        return cartMapper.selectCartList(SecurityUtils.getUserId());
    }

    /**
     * 新增购物车记录
     */
    @Override
    public int insertCart(ToyCart cart)
    {
        cart.setUserId(SecurityUtils.getUserId());
        ToyCart existing = cartMapper.selectCartByUserAndProduct(cart);
        if (existing != null)
        {
            existing.setDuration(existing.getDuration() + cart.getDuration());
            return cartMapper.updateCart(existing);
        }
        return cartMapper.insertCart(cart);
    }

    /**
     * 修改购物车记录
     */
    @Override
    public int updateCart(ToyCart cart)
    {
        return cartMapper.updateCart(cart);
    }

    /**
     * 删除购物车记录
     */
    @Override
    public int deleteCartById(Long id)
    {
        return cartMapper.deleteCartById(id);
    }
}
