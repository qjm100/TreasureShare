package com.ruoyi.toy.service.impl;

import com.ruoyi.toy.domain.ToyCategory;
import com.ruoyi.toy.mapper.ToyCategoryMapper;
import com.ruoyi.toy.service.IToyCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 玩具分类Service业务层处理
 *
 * @author Ciami
 */
@Service
public class ToyCategoryServiceImpl implements IToyCategoryService
{
    @Autowired
    private ToyCategoryMapper categoryMapper;

    /**
     * 查询玩具分类列表
     */
    @Override
    public List<ToyCategory> selectCategoryList(ToyCategory category)
    {
        return categoryMapper.selectCategoryList(category);
    }

    /**
     * 查询分类树
     */
    @Override
    public List<ToyCategory> selectCategoryTree()
    {
        List<ToyCategory> all = categoryMapper.selectCategoryTree();
        List<ToyCategory> roots = all.stream().filter(c -> c.getParentId() == 0).collect(Collectors.toList());
        for (ToyCategory root : roots)
        {
            root.setChildren(all.stream().filter(c -> c.getParentId().equals(root.getId())).collect(Collectors.toList()));
        }
        return roots;
    }

    /**
     * 根据ID查询玩具分类
     */
    @Override
    public ToyCategory selectCategoryById(Long id)
    {
        return categoryMapper.selectCategoryById(id);
    }

    /**
     * 新增玩具分类
     */
    @Override
    public int insertCategory(ToyCategory category)
    {
        return categoryMapper.insertCategory(category);
    }

    /**
     * 修改玩具分类
     */
    @Override
    public int updateCategory(ToyCategory category)
    {
        return categoryMapper.updateCategory(category);
    }

    /**
     * 删除玩具分类
     */
    @Override
    public int deleteCategoryById(Long id)
    {
        return categoryMapper.deleteCategoryById(id);
    }
}
