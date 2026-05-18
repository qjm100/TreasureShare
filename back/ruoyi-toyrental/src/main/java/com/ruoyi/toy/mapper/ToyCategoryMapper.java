package com.ruoyi.toy.mapper;

import com.ruoyi.toy.domain.ToyCategory;
import java.util.List;

/**
 * 玩具分类Mapper接口
 *
 * @author Ciami
 */
public interface ToyCategoryMapper
{
    /**
     * 查询玩具分类列表
     */
    List<ToyCategory> selectCategoryList(ToyCategory category);

    /**
     * 根据ID查询玩具分类
     */
    ToyCategory selectCategoryById(Long id);

    /**
     * 查询分类树（所有启用的分类）
     */
    List<ToyCategory> selectCategoryTree();

    /**
     * 新增玩具分类
     */
    int insertCategory(ToyCategory category);

    /**
     * 修改玩具分类
     */
    int updateCategory(ToyCategory category);

    /**
     * 删除玩具分类
     */
    int deleteCategoryById(Long id);

    /**
     * 查询子分类数量
     */
    int selectChildCountById(Long id);
}
