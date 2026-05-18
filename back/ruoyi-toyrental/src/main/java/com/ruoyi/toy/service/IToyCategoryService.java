package com.ruoyi.toy.service;

import com.ruoyi.toy.domain.ToyCategory;
import java.util.List;

/**
 * 玩具分类Service接口
 *
 * @author Ciami
 */
public interface IToyCategoryService
{
    /**
     * 查询玩具分类列表
     */
    List<ToyCategory> selectCategoryList(ToyCategory category);

    /**
     * 查询分类树
     */
    List<ToyCategory> selectCategoryTree();

    /**
     * 根据ID查询玩具分类
     */
    ToyCategory selectCategoryById(Long id);

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
}
