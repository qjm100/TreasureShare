package com.ruoyi.toy.service.impl;

import com.ruoyi.common.utils.SecurityUtils;
import com.ruoyi.toy.domain.ToyProduct;
import com.ruoyi.toy.mapper.ToyProductMapper;
import com.ruoyi.toy.service.IToyProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * 玩具产品Service业务层处理
 *
 * @author Ciami
 */
@Service
public class ToyProductServiceImpl implements IToyProductService
{
    @Autowired
    private ToyProductMapper productMapper;

    /**
     * 查询玩具产品列表
     */
    @Override
    public List<ToyProduct> selectProductList(ToyProduct product)
    {
        return productMapper.selectProductList(product);
    }

    /**
     * 根据ID查询玩具产品
     */
    @Override
    public ToyProduct selectProductById(Long id)
    {
        return productMapper.selectProductById(id);
    }

    /**
     * 新增玩具产品
     */
    @Override
    public int insertProduct(ToyProduct product)
    {
        product.setUserId(SecurityUtils.getUserId());
        product.setCreateBy(SecurityUtils.getUsername());
        product.setStatus("0");
        return productMapper.insertProduct(product);
    }

    /**
     * 修改玩具产品
     */
    @Override
    public int updateProduct(ToyProduct product)
    {
        product.setUpdateBy(SecurityUtils.getUsername());
        return productMapper.updateProduct(product);
    }

    /**
     * 查询当前用户的产品列表
     */
    @Override
    public List<ToyProduct> selectMyProducts()
    {
        return productMapper.selectMyProducts(SecurityUtils.getUserId());
    }

    /**
     * 删除玩具产品
     */
    @Override
    public int deleteProductById(Long id)
    {
        ToyProduct product = productMapper.selectProductById(id);
        if (product == null)
        {
            throw new com.ruoyi.common.exception.ServiceException("商品不存在");
        }
        if (!SecurityUtils.getUserId().equals(product.getUserId()))
        {
            throw new com.ruoyi.common.exception.ServiceException("只能删除自己发布的商品");
        }
        return productMapper.deleteProductById(id);
    }
}
