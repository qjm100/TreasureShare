package com.ruoyi.toy.domain;

import java.util.ArrayList;
import java.util.List;
import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 玩具分类对象 toy_category
 *
 * @author Ciami
 */
public class ToyCategory extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    private Long id;

    private Long parentId;

    private String name;

    private Integer sort;

    private String status;

    private List<ToyCategory> children = new ArrayList<>();

    public Long getId()
    {
        return id;
    }

    public void setId(Long id)
    {
        this.id = id;
    }

    public Long getParentId()
    {
        return parentId;
    }

    public void setParentId(Long parentId)
    {
        this.parentId = parentId;
    }

    public String getName()
    {
        return name;
    }

    public void setName(String name)
    {
        this.name = name;
    }

    public Integer getSort()
    {
        return sort;
    }

    public void setSort(Integer sort)
    {
        this.sort = sort;
    }

    public String getStatus()
    {
        return status;
    }

    public void setStatus(String status)
    {
        this.status = status;
    }

    public List<ToyCategory> getChildren()
    {
        return children;
    }

    public void setChildren(List<ToyCategory> children)
    {
        this.children = children;
    }
}
