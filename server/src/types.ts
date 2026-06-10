export enum Category {
    SOFA = 'SOFA',
    MESA = 'MESA',
    CADEIRA = 'CADEIRA',
    CAMA = 'CAMA',
    ARMARIO = 'ARMARIO',
    ESTANTE = 'ESTANTE',
    OUTROS = 'OUTROS'
}

export enum Condition {
    NOVO = 'NOVO',
    BOM = 'BOM',
    REPARO = 'REPARO'
}

export enum ItemStatus {
    AVAILABLE = 'AVAILABLE',
    PENDING = 'PENDING',
    RESERVED = 'RESERVED',
    DONATED = 'DONATED'
}

export enum RequestStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}
