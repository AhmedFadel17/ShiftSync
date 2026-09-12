using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using ShiftSync.API.Data;

namespace ShiftSync.API.Repositories;

public class BaseRepository<T> : IBaseRepository<T> where T : class
{
    protected readonly ApplicationDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public BaseRepository(ApplicationDbContext context)
    {
        _context = context;
        _dbSet = _context.Set<T>();
    }

    public IQueryable<T> Query()
    {
        return _dbSet.AsQueryable();
    }

    public async Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet.ToListAsync(cancellationToken);
    }

    // public async Task<(IEnumerable<T>, int)> GetAllWithPaginationAsync(
    //     IQueryable query,
    //     int page,
    //     int pageSize,
    //     string? orderBy,
    //     string? sortOrder,
    //     int? limit,
    //     CancellationToken cancellationToken = default)
    // {
    //     int totalCount = await query.CountAsync(cancellationToken);
    //     query = query.ApplyOrdering(orderBy, sortOrder);


    //     if (limit.HasValue)
    //     {
    //         query = query.Take(limit.Value);
    //     }
    //     else
    //     {
    //         query = query.ApplyPagination(page, pageSize);
    //     }

    //     var items = await query.ToListAsync(cancellationToken);

    //     return (items, totalCount);
    // }

    public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
    {
        return await _dbSet.Where(predicate).ToListAsync(cancellationToken);
    }

    public async Task<T> AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        await _dbSet.AddAsync(entity, cancellationToken);
        return entity;
    }

    public async Task AddRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default)
    {
        await _dbSet.AddRangeAsync(entities, cancellationToken);
    }

    public T Update(T entity)
    {
        _context.Entry(entity).State = EntityState.Modified;
        return entity;
    }

    public void Remove(T entity)
    {
        _dbSet.Remove(entity);
    }

    public void RemoveRange(IEnumerable<T> entities)
    {
        _dbSet.RemoveRange(entities);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Database.BeginTransactionAsync(cancellationToken);
    }
}