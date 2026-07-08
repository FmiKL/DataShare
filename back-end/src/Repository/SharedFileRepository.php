<?php

namespace App\Repository;

use App\Entity\SharedFile;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<SharedFile>
 */
class SharedFileRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, SharedFile::class);
    }

    /** @return SharedFile[] */
    public function findByOwnerOrderedByCreationDate(User $userOwner): array
    {
        return $this->createQueryBuilder('s')
            ->andWhere('s.owner = :owner')
            ->setParameter('owner', $userOwner)
            ->orderBy('s.createdAt', 'DESC')
            ->getQuery()
            ->getResult()
        ;
    }

    public function findOneByDownloadToken(string $downloadToken): ?SharedFile
    {
        return $this->findOneBy(['downloadToken' => $downloadToken]);
    }

    public function findOneByIdAndOwner(int $id, User $userOwner): ?SharedFile
    {
        return $this->createQueryBuilder('s')
            ->andWhere('s.id = :id')
            ->andWhere('s.owner = :owner')
            ->setParameter('id', $id)
            ->setParameter('owner', $userOwner)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }

    //    /**
    //     * @return SharedFile[] Returns an array of SharedFile objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('s')
    //            ->andWhere('s.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('s.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?SharedFile
    //    {
    //        return $this->createQueryBuilder('s')
    //            ->andWhere('s.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
