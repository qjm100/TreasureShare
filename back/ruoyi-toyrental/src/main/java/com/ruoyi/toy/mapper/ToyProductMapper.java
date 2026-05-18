package com.ruoyi.toy.mapper;

import com.ruoyi.toy.domain.ToyProduct;
import java.util.List;

/**
 * 玩具产品Mapper接口
 *
 * @author Ciami
 */
public interface ToyProductMapper
{
    /**
     * 查询玩具产品列表
     */
    List<ToyProduct> selectProductList(ToyProduct product);

    /**
     * 根据ID查询玩具产品
     */
    ToyProduct selectProductById(Long id);

    /**
     * 新增玩具产品
     */
    int insertProduct(ToyProduct product);

    /**
     * 修改玩具产品
     */
    int updateProduct(ToyProduct product);

    /**
     * 查询当前用户的产品列表
     */
    List<ToyProduct> selectMyProducts(Long userId);

    /**
     * 删除玩具产品（软删除）
     */
    int deleteProductById(Long id);
}
